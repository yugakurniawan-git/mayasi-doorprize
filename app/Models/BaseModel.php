<?php

namespace App\Models;

use App\Events\LoadDataEvent;
use App\Models\Account\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Illuminate\Support\Str;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

trait BaseModel
{
  use LogsActivity;

  protected static function booted()
  {
    static::creating(function ($model) {
      if ($model->keyType === 'string' && !$model->getKey()) {
        $model->{$model->getKeyName()} = (string) Str::uuid();
      }
      if (Auth::check() && $model->fillable && in_array('created_by', $model->fillable) && in_array('updated_by', $model->fillable)) {
        $model->created_by = Auth::user()->id;
        $model->updated_by = Auth::user()->id;
      }
      event(new LoadDataEvent([
        'action'  => 'load-data',
        'table'   => $model->getTable(),
      ]));
    });
    static::updating(function ($model) {
      if (Auth::check() && $model->fillable && in_array('updated_by', $model->fillable)) {
        $model->updated_by = Auth::user()->id;
      }
      event(new LoadDataEvent([
        'action'  => 'load-data',
        'table'   => $model->getTable(),
      ]));
    });
  }

  public function getActivitylogOptions(): LogOptions
  {
    return LogOptions::defaults()
      ->logAll()
      ->useLogName($this->connection)
      ->setDescriptionForEvent(fn(string $eventName) => "{$this->table} has been $eventName")
      ->logOnlyDirty();
  }

  public function scopeInclude($query)
  {
    if (request()->has('include') && is_array(request('include')) && count(request('include')) > 0) {
      return $query->with(request('include'));
    }
  }

  public function scopeSelectColumns($query)
  {
    if (request()->has('fields') && is_array(request('fields')) && count(request('fields')) > 0) {
      return $query->select(request('fields'));
    }
    return $query;
  }

  public function scopeFilter($query)
  {
    $this->applySearchFilter($query);
    $this->applyColumnFilters($query);
    $this->applyWheres($query);
  }

  public function scopeJoins($query)
  {
    if (request()->has('joins') && is_array(request('joins')) && count(request('joins')) > 0) {
      foreach (request('joins') as $join) {
        $parts = explode(',', $join);
        $table = $parts[0];
        $on1 = $parts[1] ?? null;
        $condition = $parts[2] ?? null;
        $on2 = $parts[3] ?? null;
        $type = $parts[4] ?? 'inner';

        if ($table && $on1 && $condition && $on2) {
          switch (strtolower($type)) {
            case 'left':
              $query->leftJoin($table, $on1, $condition, $on2);
              break;
            case 'right':
              $query->rightJoin($table, $on1, $condition, $on2);
              break;
            case 'cross':
              $query->crossJoin($table, $on1, $condition, $on2);
              break;
            default:
              $query->join($table, $on1, $condition, $on2);
              break;
          }
        }
      }
    }
  }

  private function applySearchFilter($query)
  {
    if (!request()->has('q')) {
      return;
    }

    $search = request('q');
    $table = $this->connection ? $this->connection . '.dbo.' . $this->table : $this->table;

    $query->where(function ($subQuery) use ($table, $search) {
      if (request()->has('fields') && is_array(request('fields')) && count(request('fields')) > 0) {
        foreach (request('fields') as $field) {
          if (str_contains($field, '.*')) {
            $field = str_replace('.*', '', $field);
            $columns = DB::getSchemaBuilder()->getColumnListing($field);
            foreach ($columns as $column) {
              $subQuery->orWhere("{$field}.{$column}", 'like', '%' . $search . '%');
            }
          } else {
            if (str_contains($field, ' as ')) {
              $field = explode(' as ', $field)[0];
            }
            $subQuery->orWhere("{$field}", 'like', '%' . $search . '%');
          }
        }
      } else {
        foreach ($this->fillable as $key => $column) {
          $method = $key === 0 ? 'where' : 'orWhere';
          $subQuery->$method("{$table}.{$column}", 'like', '%' . $search . '%');
        }
      }

      if (request()->has('include') && is_array(request('include')) && count(request('include')) > 0) {
        foreach (request('include') as $relation) {
          $this->applySearchNestedRelation($subQuery, $relation, $search);
        }
      }
    });
  }

  private function applySearchNestedRelation($query, $relation, $search)
  {
    // Pisahkan antara path dan field
    $parts = explode(':', $relation);
    $path = $parts[0]; // e.g. "course.department.faculty"
    $fields = isset($parts[1]) ? explode(',', $parts[1]) : [];

    $relations = explode('.', $path);

    $this->recursiveRelationSearch($query, $relations, $fields, $search);
  }

  public function recursiveRelationSearch($query, $relations, $fields, $search)
  {
    $relationName = array_shift($relations);

    if (!method_exists($this, $relationName)) {
      return;
    }

    $query->orWhereHas($relationName, function ($relQuery) use ($relations, $fields, $search, $relationName) {
      // Kalau masih ada nested relasi → lanjut rekursif
      if (!empty($relations)) {
        $relatedModel = $this->$relationName()->getRelated();
        $relatedModel->recursiveRelationSearch($relQuery, $relations, $fields, $search);
      } else {
        // Sudah mentok, apply field search
        foreach ($fields as $i => $field) {
          $method = $i === 0 ? 'where' : 'orWhere';
          $relQuery->$method($field, 'like', '%' . $search . '%');
        }
      }
    });
  }

  private function applyColumnFilters($query)
  {
    $filters = request()->all();

    $query->where(function ($subQuery) use ($filters) {
      foreach ($filters as $column => $value) {
        // Skip parameter non-filter
        if (in_array($column, [
          'q',
          'include',
          'fields',
          'joins',
          'wheres',
          'details',
          'sort_by',
          'sort_type',
          'per_page',
          'page',
        ])) {
          continue;
        }

        $operator = '=';
        if (str_contains($column, ':')) {
          $parts = explode(':', $column);
          $operator = end($parts);
          $column = $parts[0];
        }

        // Jika mengandung relasi (misal "profile-address-city")
        if (str_contains($column, '->')) {
          $parts = explode('->', $column);
          $relation = implode('->', array_slice($parts, 0, -1)); // "profile-address"
          $column = end($parts); // "city"

          $subQuery->whereHas(str_replace('->', '.', $relation), function ($relQuery) use ($column, $operator, $value) {
            $this->wheres($relQuery, $column, $operator, $value);
          });
        } else {
          $this->wheres($subQuery, $column, $operator, $value);
        }
      }
    });
  }

  private function applyWheres($query)
  {
    $query->when(request()->has('wheres') && is_array(request('wheres')), function ($q) {
      $q->where(function ($q) {
        foreach (request('wheres') as $where) {
          $parts = explode(',', $where);
          $column = $parts[0];
          $operator = $parts[1] ?? '=';
          $value = $parts[2] ?? null;
          $this->wheres($q, $column, $operator, $value);
        }
      });
    });
  }

  private function wheres($q, $column, $operator, $value)
  {
    if ($column && $value !== null) {
      switch ($operator) {
        case 'in':
          $q->whereIn($column, explode('|', $value));
          break;
        case 'not_in':
          $q->whereNotIn($column, explode('|', $value));
          break;

        case 'null':
          $q->whereNull($column);
          break;
        case 'not_null':
          $q->whereNotNull($column);
          break;

        case 'between':
          $q->whereBetween($column, explode('|', $value));
          if ($value && str_contains($value, '|')) {
              [$start, $end] = explode('|', $value);
              $q->whereBetween($column, [$start, $end]);
          }
          break;

        case 'year':
          $q->whereYear($column, $value);
          break;
        case 'month':
          $q->whereMonth($column, $value);
          break;
        case 'day':
          $q->whereDay($column, $value);
          break;
        case 'date':
          $q->whereDate($column, $value);
          break;

        case 'like':
        case '!=':
        case '<>':
        case '>':
        case '<':
        case '>=':
        case '<=':
          $q->where($column, $operator, $value);
          break;

        default:
          $q->where($column, $value);
          break;
      }
    }
  }

  public function scopeList($query, $options = [])
  {
    $defaults = [
      'sort_by'   => 'created_at',
      'sort_type' => 'desc',
      'per_page'  => 10,
      'page'      => 1,
    ];

    $options = array_merge($defaults, $options);
    $query->include()->filter()->joins()->selectColumns();

    $sortBy = request('sort_by', $options['sort_by']);
    $sortType = request('sort_type', $options['sort_type']);

    // cek apakah sort_by mengandung relasi
    if (str_contains($sortBy, '->')) {
      // $sortBy = "course->department->fakultas->nama_fakultas"
      $parts = explode('->', $sortBy); // ['course', 'department', 'fakultas', 'nama_fakultas']
      $column = array_pop($parts);    // 'nama_fakultas'
      $relationPath = implode('.', $parts); // 'course.department.fakultas'
      $alias = str_replace('->', '_', $sortBy); // 'course_department_fakultas_nama_fakultas'

      $query->withAggregate($relationPath, $column);
      $query->orderBy($alias, $sortType);
    } else {
      // default orderBy field di tabel utama
      $query->orderBy($sortBy, $sortType);
    }

    $perPage = request('per_page', $options['per_page']);
    Log::info("SQL Query: " . $query->toSql());

    // Handle the case when per_page is -1 (get all data)
    if ($perPage == -1) {
      $data = $query->get();

      // Create a fake pagination response for consistency with frontend
      return new \Illuminate\Pagination\LengthAwarePaginator(
        $data,
        $data->count(),
        $data->count(),
        1,
        ['path' => request()->url()]
      );
    }

    return $query->paginate(
      $perPage,
      ['*'],
      'page',
      request('page', $options['page'])
    );

  }

  public function creator()
  {
    return $this->belongsTo(User::class, 'created_by', 'id');
  }

  public function updater()
  {
    return $this->belongsTo(User::class, 'updated_by', 'id');
  }

  public function deleter()
  {
    return $this->belongsTo(User::class, 'deleted_by', 'id');
  }
}
