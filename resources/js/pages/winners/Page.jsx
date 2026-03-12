import PrivateLayout from "../../components/layouts/PrivateLayout";
import { useEffect, useState } from "react";
import Error403Page from "../errors/Error403page";
import { no, statusWinners } from "../../helpers";
import TableCard from "../../components/fragments/TableCard";
import { apiService } from "../../services/api.services";
import useUrlParams from "../../hooks/useUrlParams";
// import useLoadData from "../../hooks/useLoadData";
import moment from "moment";
import useAuth from "../../hooks/useAuth";
import { Link } from "react-router";
import Badge from "../../components/elements/Badge";
import ModalDetail from "./ModalDetail";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import Swal from "sweetalert2";
import { faBars, faEdit, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import Dropdown from "../../components/elements/Dropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useWindowSize from "../../hooks/useWindowSize";
import { useRef } from "react";
import ModalFilter from "./ModalFilter";

function Page() {
  Fancybox.bind();
  // useLoadData((data) => {
  //   if (data.action === 'load-data' && data.table === 'winners') {
  //     getWinners();
  //   }
  // });
  const [params, setParams] = useUrlParams();
  const width = useWindowSize();
  const { can } = useAuth();
  if (!can("view list winners")) {
    return <Error403Page />;
  }

  const [winners, setWinners] = useState({});
  const [winner, setWinner] = useState({});
	const [isLoading, setIsLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openModalFilter, setOpenModalFilter] = useState(false);
  const [selectedWinners, setSelectedWinners] = useState([]);
  const statusWinnersRef = useRef(statusWinners[0].value);
  const noteWinnersRef = useRef('');

  useEffect(() => {
    document.title = "Winner - Winners Management";
    if (!params.sort_by || !params.sort_type || !params["claimed_at:not_null"]) {
      setParams((prev) => ({
        ...prev,
        sort_by: params.sort_by || "created_at",
        sort_type: params.sort_type || "desc",
        "claimed_at:not_null": 1
      }));
    }
  }, []);

	useEffect(() => {
    if (params.sort_by && params.sort_type && params["claimed_at:not_null"]) {
		  getWinners(true);
    }
	}, [
    params.sort_by,
    params.sort_type,
    params.page,
    params.per_page,
    params.q,
    params["claimed_at:not_null"],
    params["status:in"],
    params["doorprize_id:in"],
    params["claimed_at:>="],
    params["claimed_at:<="],
  ]);

	async function getWinners(loading = false) {
		setIsLoading(loading);
		const response = await apiService("GET", "/api/winners", {
			params: {
        include: [
          "doorprize:id,name",
          "doorprize.images:id,doorprize_id,image_path"
        ],
				...params,
			},
		});
    setWinners(response.data);
    setIsLoading(false);
	}

  async function exportToExcel() {
    // Show modal confirmation
    Swal.fire({
      title: 'Export to Excel',
      text: 'Are you sure you want to export the winners to an Excel file?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, export it!',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Exporting...',
          text: 'Please wait while we generate the Excel file.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        // create workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Winners');

        // define columns
        worksheet.columns = [
          { header: 'No', key: 'no', width: 5 },
          { header: 'Name', key: 'name', width: 30 },
          { header: 'Email', key: 'email', width: 30 },
          { header: 'Phone', key: 'phone', width: 15 },
          { header: 'Doorprize', key: 'doorprize', width: 30 },
          { header: 'Address', key: 'address', width: 40 },
          { header: 'ID', key: 'id', width: 40 },
          { header: 'Code', key: 'code', width: 20 },
          { header: 'Claimed At', key: 'claimed_at', width: 20 },
          { header: 'Notes', key: 'notes', width: 30 },
          { header: 'Status', key: 'status', width: 15 },
        ];

        // add rows
        winners.data.forEach((item, index) => {
          worksheet.addRow({
            no: index + 1,
            name: item.name,
            email: item.email,
            phone: item.phone,
            doorprize: item.doorprize?.name || '',
            address: item.address,
            id: item.id,
            code: item.code,
            claimed_at: item.claimed_at ? moment(item.claimed_at).format('lll') : '',
            notes: item.notes,
            status: item.status_detail?.label || '',
          });
        });

        // generate buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // save file
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'winners.xlsx');

        Swal.close();
      }
    });
  }

  async function bulkUpdateStatus() {
    let selectedStatus = statusWinnersRef.current;
    let selectedNotes = noteWinnersRef.current;
    Swal.fire({
      title: 'Bulk Update Status',
      html: `
        <div style="margin-bottom:10px;">Select the new status for the selected winners:</div>
        <select id="swal-status-select" class="border rounded w-full p-2">
          ${statusWinners.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
        </select>
        <textarea id="swal-notes-textarea" class="border rounded w-full p-2 mt-2" placeholder="Enter notes"></textarea>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, update it!',
      cancelButtonText: 'Cancel',
      didOpen: () => {
        const select = Swal.getPopup().querySelector('#swal-status-select');
        select.value = statusWinnersRef.current;
        select.addEventListener('change', (e) => {
          selectedStatus = e.target.value;
        });
        const textarea = Swal.getPopup().querySelector('#swal-notes-textarea');
        textarea.value = noteWinnersRef.current;
        textarea.addEventListener('input', (e) => {
          selectedNotes = e.target.value;
        });
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Updating...',
          text: 'Please wait while we update the winners.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        await apiService("PUT", "/api/winners", {
          data: {
            ids: selectedWinners,
            status: selectedStatus,
            notes: selectedNotes,
          }
        });

        setSelectedWinners([]);
        getWinners(true);
        Swal.close();
        Swal.fire('Updated!', 'The status of the selected winners has been updated.', 'success');
      }
    });
  }

  return (
    <PrivateLayout>
      <TableCard
        title="Winners"
        response={winners}
        setParams={setParams}
        params={params}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        action={can("export winners") && (
          <Dropdown
            useCaret={false}
            align={width < 640 ? "" : "right"}
            label={
              <div className="flex flex-row justify-center items-center gap-2">
                <FontAwesomeIcon icon={faBars} />
              </div>
            }
          >
            <Dropdown.Item onClick={() => setOpenModalFilter(true)}>
              <FontAwesomeIcon className="me-1" icon={faEdit} /> Filters
            </Dropdown.Item>
            {can("export winners") && (
              <Dropdown.Item onClick={exportToExcel}>
                <FontAwesomeIcon className="me-1" icon={faFileExcel} /> Export to Excel
              </Dropdown.Item>
            )}
            {selectedWinners.length > 0 && can("edit winner") && (
              <Dropdown.Item onClick={bulkUpdateStatus}>
                <FontAwesomeIcon icon={faEdit} /> Bulk Update Status
              </Dropdown.Item>
            )}
          </Dropdown>
        )}
      >
        <TableCard.Table>
          <TableCard.Thead>
            <tr>
              <TableCard.Th className="text-start">
                <input
                  type="checkbox"
                  className="size-4 form-checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      const allIds = winners?.data?.map(item => item.id) || [];
                      setSelectedWinners(allIds);
                    } else {
                      setSelectedWinners([]);
                    }
                  }}
                  checked={winners?.data?.length > 0 && selectedWinners.length === winners?.data?.length}
                />
              </TableCard.Th>
              <TableCard.Th className="text-start">No</TableCard.Th>
              <TableCard.Th className="text-start" sortBy="name">Winner</TableCard.Th>
              <TableCard.Th className="text-start" sortBy="doorprize->name">Doorprize</TableCard.Th>
              <TableCard.Th className="text-start" sortBy="address">Address</TableCard.Th>
              <TableCard.Th className="text-start" sortBy="id">ID</TableCard.Th>
              <TableCard.Th className="text-start" sortBy="code">Code</TableCard.Th>
              <TableCard.Th className="text-start" sortBy="claimed_at">Claimed At</TableCard.Th>
              <TableCard.Th className="text-start" sortBy="notes">Notes</TableCard.Th>
              <TableCard.Th className="text-start" sortBy="status">Status</TableCard.Th>
            </tr>
          </TableCard.Thead>
          <TableCard.Tbody>
            {isLoading ? <TableCard.Loading totalColumns={10} /> : winners?.data?.length > 0 ? (
              winners?.data?.map((item, index) => (
                <TableCard.Tr
                  key={item.id}
                  onClick={() => {
                    setWinner(item);
                    setOpenModal(true);
                  }}
                  className="cursor-pointer"
                >
                  <TableCard.Td>
                    <input
                      type="checkbox"
                      className="size-4 form-checkbox"
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedWinners([...selectedWinners, item.id]);
                        } else {
                          setSelectedWinners(selectedWinners.filter(id => id !== item.id));
                        }
                      }}
                      checked={selectedWinners.includes(item.id)}
                    />
                  </TableCard.Td>
                  <TableCard.Td>{no(winners, index + 1)}</TableCard.Td>
                  <TableCard.Td>
                    {item.name} <br />
                    <Link target="_blank" to={`mailto:${item.email}`} className="text-rise hover:text-primary duration-200 ease-in-out">
                      {item.email}
                    </Link> <br />
                    <Link target="_blank" to={`https://wa.me/${item.phone}`} className="text-rise hover:text-primary duration-200 ease-in-out">
                      {item.phone}
                    </Link>
                  </TableCard.Td>
                  <TableCard.Td>{item.doorprize?.name}</TableCard.Td>
                  <TableCard.Td>{item.address}</TableCard.Td>
                  <TableCard.Td>{item.id}</TableCard.Td>
                  <TableCard.Td>{item.code}</TableCard.Td>
                  <TableCard.Td>{item.claimed_at && moment(item.claimed_at).format('lll')}</TableCard.Td>
                  <TableCard.Td>{item.notes}</TableCard.Td>
                  <TableCard.Td>
                    <Badge className={item.status_detail?.class}>
                      {item.status_detail?.label}
                    </Badge>
                  </TableCard.Td>
                </TableCard.Tr>
              ))
            ) : <TableCard.Empty totalColumns={10} />}
          </TableCard.Tbody>
        </TableCard.Table>
      </TableCard>
      <ModalDetail
        openModal={openModal}
        setOpenModal={setOpenModal}
        winner={winner}
        setWinner={setWinner}
        loadData={getWinners}
      />
      <ModalFilter
        openModal={openModalFilter}
        setOpenModal={setOpenModalFilter}
        params={params}
        setParams={setParams}
      />
    </PrivateLayout>
  );
}

export default Page;
