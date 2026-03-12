import Modal from "../../components/elements/Modal";
import Button from "../../components/elements/Button";
import SelectInput from "../../components/elements/input/SelectInput";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useContext } from "react";
import { DarkModeContext } from "../../context/DarkMode";
import SelectAsyncPaginate from "../../components/elements/input/SelectAsyncPaginate";
import moment from "moment";

function ModalFilter({ openModal, setOpenModal, params, setParams }) {
  const {isDarkMode} = useContext(DarkModeContext);
  const statusOptions = [
    { value: 0, label: "Pending" },
    { value: 1, label: "Claimmed" },
    { value: 2, label: "On Process" },
    { value: 3, label: "Shipped" },
    { value: 4, label: "Delivered" },
    { value: 5, label: "Cancelled" },
  ];
  return (
    <Modal show={openModal} onClose={() => setOpenModal(false)}>
      <Modal.Header>Filters</Modal.Header>
      <Modal.Body>
        <div className="flex flex-col gap-3">
          <SelectAsyncPaginate
            label="Doorprize"
            url="/api/doorprizes?fields[]=id&fields[]=name"
            getOptionValue={(option) => option.id}
            getOptionLabel={(option) => option.name}
            isMulti={true}
            value={params["doorprize_id:in"]
              ? params["doorprize_id:in"]
                  .split("|")
                  .map((id, index) => ({
                    id: id,
                    name: params["details[doorprize_names]"]
                      ? params["details[doorprize_names]"].split("|")[index]
                      : "",
                  }))
              : []
            }
            onChange={(selectedOption) => {
              setParams((prev) => ({
                ...prev,
                "doorprize_id:in": selectedOption?.map(option => option.id).join("|") || "",
                "details[doorprize_names]": selectedOption?.map(option => option.name).join("|") || "",
              }));
            }}
            menuPlacement="top"
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 999999 }) }}
          />
          <SelectInput
            label="Status"
            options={statusOptions}
            isMulti={true}
            value={params["status:in"]
              ? statusOptions.filter((option) =>
                  params["status:in"].split("|").includes(option.value.toString())
                )
              : []
            }
            onChange={(selectedOption) => {
              setParams((prev) => ({
                ...prev,
                "status:in": selectedOption?.map(option => option.value).join("|") || "",
              }));
            }}
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 999999 }) }}
          />
          {/* filter claimed_at between start date and end date  with datepicker range*/}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-500">Claimed At</label>
            <div className="flex">
              <DatePicker
                selected={params["claimed_at:>="] ? new Date(params["claimed_at:>="]) : null}
                onChange={(date) => {
                  setParams((prev) => ({
                    ...prev,
                    "claimed_at:>=": date ? moment(date).format('YYYY-MM-DD') : "",
                  }));
                }}
                selectsStart
                startDate={params["claimed_at:>="] ? new Date(params["claimed_at:>="]) : null}
                endDate={params["claimed_at:<="] ? new Date(params["claimed_at:<="]) : null}
                dateFormat="MMMM d, yyyy"
                date
                placeholderText="Claimed At (Start Date)"
                className={`w-full h-[38px] px-3 border-0 text-sm rounded-sm cursor-pointer ${isDarkMode ? 'bg-slate-700 text-slate-100 placeholder-slate-400' : 'bg-white text-slate-900 placeholder-slate-500'}`}
                wrapperClassName={`w-full z-50 transition duration-200 ease-in-out rounded-sm ring-1 ring-gray-300 focus:ring-1 focus:outline-none focus:ring-gray-300`}
              />
              <div className="mx-2 flex items-center text-gray-500">to</div>
              <DatePicker
                selected={params["claimed_at:<="] ? new Date(params["claimed_at:<="]) : null}
                onChange={(date) => {
                  setParams((prev) => ({
                    ...prev,
                    "claimed_at:<=": date ? moment(date).format('YYYY-MM-DD') : "",
                  }));
                }}
                selectsEnd
                startDate={params["claimed_at:>="] ? new Date(params["claimed_at:>="]) : null}
                endDate={params["claimed_at:<="] ? new Date(params["claimed_at:<="]) : null}
                dateFormat="MMMM d, yyyy"
                placeholderText="Claimed At (End Date)"
                className={`w-full h-[38px] px-3 border-0 text-sm rounded-sm cursor-pointer ${isDarkMode ? 'bg-slate-700 text-slate-100 placeholder-slate-400' : 'bg-white text-slate-900 placeholder-slate-500'}`}
                wrapperClassName={`w-full z-50 transition duration-200 ease-in-out rounded-sm ring-1 ring-gray-300 focus:ring-1 focus:outline-none focus:ring-gray-300`}
              />
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          bg={`bg-slate-500`}
          type="button"
          onClick={() => {
            setParams({
              sort_by: "created_at",
              sort_type: "desc",
              "claimed_at:not_null": 1
            })
          }}
        >
          Reset
        </Button>
        <Button type="button" onClick={() => setOpenModal(false)}>Done</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalFilter;
