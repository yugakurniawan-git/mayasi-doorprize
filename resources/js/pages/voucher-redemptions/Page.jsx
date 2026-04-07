import PrivateLayout from "../../components/layouts/PrivateLayout";
import { useEffect, useState } from "react";
import Error403Page from "../errors/Error403page";
import { no } from "../../helpers";
import TableCard from "../../components/fragments/TableCard";
import { apiService, apiServicePost } from "../../services/api.services";
import useUrlParams from "../../hooks/useUrlParams";
import useAuth from "../../hooks/useAuth";
import moment from "moment";
import { Toast } from "../../helpers";
import Swal from "sweetalert2";

const STATUS_LABELS = {
  0: { label: "Pending",    className: "bg-yellow-100 text-yellow-700" },
  1: { label: "Processing", className: "bg-blue-100 text-blue-700" },
  2: { label: "Sent",       className: "bg-green-100 text-green-700" },
  3: { label: "Cancelled",  className: "bg-red-100 text-red-600" },
};

function Page() {
  const { can } = useAuth();
  const [params, setParams] = useUrlParams();
  const [redemptions, setRedemptions] = useState({});
  const [selected, setSelected] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  if (!can("view list voucher redemptions")) return <Error403Page />;

  useEffect(() => {
    document.title = "Voucher Redemptions";
    if (!params.sort_by || !params.sort_type) {
      setParams((prev) => ({ ...prev, sort_by: "redeemed_at", sort_type: "desc" }));
    }
  }, []);

  useEffect(() => {
    load(true);
  }, [params.sort_by, params.sort_type, params.page, params.per_page, params.q]);

  async function load(loading = false) {
    setIsLoading(loading);
    const response = await apiService("GET", "/api/voucher-redemptions", {
      params: { include: ["campaign", "prizeTier"], ...params }
    });
    setRedemptions(response.data);
    setSelected([]);
    setIsLoading(false);
  }

  async function updateStatus(ids, status) {
    const res = await apiServicePost("/api/voucher-redemptions", { _method: "PUT", ids, status });
    // Use PUT via POST with _method override OR call directly
    const res2 = await apiService("PUT", "/api/voucher-redemptions", { data: { ids, status } });
    if (res2.status === 200) {
      Toast.fire({ icon: "success", title: "Status updated" });
      load();
    }
  }

  async function updateSingle(id, status) {
    const res = await apiService("PUT", `/api/voucher-redemptions/${id}`, { data: { status } });
    if (res.status === 200) {
      Toast.fire({ icon: "success", title: "Status updated" });
      load();
    }
  }

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleAll = () => setSelected(prev => prev.length === redemptions?.data?.length ? [] : redemptions?.data?.map(r => r.id));

  return (
    <PrivateLayout>
      {selected.length > 0 && can("edit voucher redemption") && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white shadow-lg border rounded-full px-6 py-3 flex gap-3 z-50">
          <span className="text-sm font-medium">{selected.length} selected</span>
          {Object.entries(STATUS_LABELS).map(([status, { label }]) => (
            <button
              key={status}
              className="text-xs px-3 py-1 rounded-full border hover:bg-gray-100"
              onClick={() => updateStatus(selected, Number(status))}
            >Mark as {label}</button>
          ))}
        </div>
      )}

      <TableCard
        title="Voucher Redemptions"
        response={redemptions}
        setParams={setParams}
        params={params}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      >
        <TableCard.Table>
          <TableCard.Thead>
            <tr>
              <TableCard.Th>
                <input type="checkbox" onChange={toggleAll} checked={selected.length === redemptions?.data?.length && redemptions?.data?.length > 0} />
              </TableCard.Th>
              <TableCard.Th className="text-start">No</TableCard.Th>
              <TableCard.Th className="text-start" sortBy="name">Name</TableCard.Th>
              <TableCard.Th className="text-start" sortBy="phone">Phone</TableCard.Th>
              <TableCard.Th className="text-start">Campaign</TableCard.Th>
              <TableCard.Th className="text-start">Prize</TableCard.Th>
              <TableCard.Th className="text-start" sortBy="status">Status</TableCard.Th>
              <TableCard.Th className="text-start" sortBy="redeemed_at">Redeemed At</TableCard.Th>
              {can("edit voucher redemption") && <TableCard.Th className="text-start">Action</TableCard.Th>}
            </tr>
          </TableCard.Thead>
          <TableCard.Tbody>
            {isLoading ? <TableCard.Loading totalColumns={9} /> : redemptions?.data?.length > 0 ? (
              redemptions?.data?.map((item, index) => (
                <TableCard.Tr key={item.id}>
                  <TableCard.Td>
                    <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleSelect(item.id)} />
                  </TableCard.Td>
                  <TableCard.Td>{no(redemptions, index + 1)}</TableCard.Td>
                  <TableCard.Td className="font-medium">{item.name}</TableCard.Td>
                  <TableCard.Td>{item.phone}</TableCard.Td>
                  <TableCard.Td className="text-sm text-gray-500">{item.campaign?.name || "—"}</TableCard.Td>
                  <TableCard.Td>
                    {item.prize_tier ? (
                      <span className="font-semibold text-green-700">
                        Rp {Number(item.prize_tier?.amount).toLocaleString("id-ID")}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">Belum Beruntung</span>
                    )}
                  </TableCard.Td>
                  <TableCard.Td>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${STATUS_LABELS[item.status]?.className}`}>
                      {STATUS_LABELS[item.status]?.label}
                    </span>
                  </TableCard.Td>
                  <TableCard.Td>{moment(item.redeemed_at).format("lll")}</TableCard.Td>
                  {can("edit voucher redemption") && (
                    <TableCard.Td>
                      <select
                        className="text-xs border rounded px-1 py-0.5"
                        value={item.status}
                        onChange={(e) => updateSingle(item.id, Number(e.target.value))}
                      >
                        {Object.entries(STATUS_LABELS).map(([s, { label }]) => (
                          <option key={s} value={s}>{label}</option>
                        ))}
                      </select>
                    </TableCard.Td>
                  )}
                </TableCard.Tr>
              ))
            ) : <TableCard.Empty totalColumns={9} />}
          </TableCard.Tbody>
        </TableCard.Table>
      </TableCard>
    </PrivateLayout>
  );
}

export default Page;
