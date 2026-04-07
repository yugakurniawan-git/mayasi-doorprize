import PrivateLayout from "../../components/layouts/PrivateLayout";
import { useEffect, useState } from "react";
import Error403Page from "../errors/Error403page";
import { no } from "../../helpers";
import TableCard from "../../components/fragments/TableCard";
import { apiService } from "../../services/api.services";
import Button from "../../components/elements/Button";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useUrlParams from "../../hooks/useUrlParams";
import useAuth from "../../hooks/useAuth";
import moment from "moment";
import ModalForm from "./ModalForm";
import { useNavigate } from "react-router";

function Page() {
  const { can } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useUrlParams();
  const [campaigns, setCampaigns] = useState({});
  const [campaign, setCampaign] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  if (!can("view list voucher campaigns")) return <Error403Page />;

  useEffect(() => {
    document.title = "Voucher Campaigns";
    if (!params.sort_by || !params.sort_type) {
      setParams((prev) => ({ ...prev, sort_by: "created_at", sort_type: "desc" }));
    }
  }, []);

  useEffect(() => {
    load(true);
  }, [params.sort_by, params.sort_type, params.page, params.per_page, params.q]);

  async function load(loading = false) {
    setIsLoading(loading);
    const response = await apiService("GET", "/api/voucher-campaigns", { params });
    setCampaigns(response.data);
    setIsLoading(false);
  }

  return (
    <PrivateLayout>
      <TableCard
        title="Voucher Campaigns"
        response={campaigns}
        setParams={setParams}
        params={params}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        action={can("create voucher campaign") && (
          <Button onClick={() => { setCampaign({}); setOpenModal(true); }}>
            <div className="flex flex-row justify-center items-center gap-2">
              <FontAwesomeIcon icon={faPlus} />
            </div>
          </Button>
        )}
      >
        <TableCard.Table>
          <TableCard.Thead>
            <tr>
              <TableCard.Th className="text-start">No</TableCard.Th>
              <TableCard.Th className="text-start" sortBy="name">Name</TableCard.Th>
              <TableCard.Th className="text-start" sortBy="slug">Slug</TableCard.Th>
              <TableCard.Th className="text-start" sortBy="start_date">Period</TableCard.Th>
              <TableCard.Th className="text-start" sortBy="is_active">Status</TableCard.Th>
              <TableCard.Th className="text-start" sortBy="created_at">Created At</TableCard.Th>
            </tr>
          </TableCard.Thead>
          <TableCard.Tbody>
            {isLoading ? <TableCard.Loading totalColumns={6} /> : campaigns?.data?.length > 0 ? (
              campaigns?.data?.map((item, index) => (
                <TableCard.Tr
                  key={item.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/voucher-campaigns/${item.id}`)}
                >
                  <TableCard.Td>{no(campaigns, index + 1)}</TableCard.Td>
                  <TableCard.Td>{item.name}</TableCard.Td>
                  <TableCard.Td>
                    <code className="text-xs bg-gray-100 px-1 rounded">{item.slug}</code>
                  </TableCard.Td>
                  <TableCard.Td>
                    {item.start_date && item.end_date
                      ? `${moment(item.start_date).format("DD MMM YYYY")} – ${moment(item.end_date).format("DD MMM YYYY")}`
                      : "—"}
                  </TableCard.Td>
                  <TableCard.Td>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${item.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {item.is_active ? "Active" : "Inactive"}
                    </span>
                  </TableCard.Td>
                  <TableCard.Td>{moment(item.created_at).format("lll")}</TableCard.Td>
                </TableCard.Tr>
              ))
            ) : <TableCard.Empty totalColumns={6} />}
          </TableCard.Tbody>
        </TableCard.Table>
      </TableCard>

      <ModalForm
        openModal={openModal}
        setOpenModal={setOpenModal}
        campaign={campaign}
        setCampaign={setCampaign}
        loadData={load}
      />
    </PrivateLayout>
  );
}

export default Page;
