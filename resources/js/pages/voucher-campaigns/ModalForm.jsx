import Modal from "../../components/elements/Modal";
import TextInput from "../../components/elements/input/TextInput";
import Button from "../../components/elements/Button";
import { useState } from "react";
import { apiServicePost, apiServiceDelete } from "../../services/api.services";
import Swal from "sweetalert2";
import { Toast } from "../../helpers";
import TextArea from "../../components/elements/input/TextArea";

function ModalForm({ openModal, setOpenModal, campaign, setCampaign, loadData }) {
  const [errors, setErrors] = useState({});

  async function handleSubmit(e) {
    e.preventDefault();
    const response = await apiServicePost("/api/voucher-campaigns", campaign);
    if ([200, 201].includes(response.status)) {
      loadData();
      handleClose();
      Toast.fire({ icon: "success", title: campaign?.id ? "Campaign updated" : "Campaign created" });
    } else {
      setErrors(response.data?.errors || {});
    }
  }

  async function handleDelete() {
    Swal.fire({
      title: "Are you sure?",
      text: "All prize tiers, codes, and redemptions will be deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await apiServiceDelete(`/api/voucher-campaigns/${campaign.id}`);
        if (response.status === 200) {
          loadData();
          handleClose();
          Toast.fire({ icon: "success", title: "Campaign deleted" });
        }
      }
    });
  }

  function handleClose() {
    setOpenModal(false);
    setCampaign({});
    setErrors({});
  }

  return (
    <Modal show={openModal} size="w-xl" onClose={handleClose}>
      <form onSubmit={handleSubmit}>
        <Modal.Header>{campaign?.id ? "Edit" : "New"} Voucher Campaign</Modal.Header>
        <Modal.Body>
          <div className="flex flex-col gap-4">
            <TextInput
              label="Campaign Name"
              required
              name="name"
              value={campaign?.name || ""}
              placeholder="e.g. Promo Lebaran 2026"
              onChange={(e) => { setCampaign({ ...campaign, name: e.target.value }); setErrors({ ...errors, name: null }); }}
              error={errors?.name}
            />
            <TextArea
              label="Description"
              name="description"
              value={campaign?.description || ""}
              placeholder="Campaign description (optional)"
              onChange={(e) => { setCampaign({ ...campaign, description: e.target.value }); }}
              error={errors?.description}
            />
            <div className="grid grid-cols-2 gap-4">
              <TextInput
                label="Start Date"
                type="date"
                name="start_date"
                value={campaign?.start_date?.substring(0, 10) || ""}
                onChange={(e) => { setCampaign({ ...campaign, start_date: e.target.value }); }}
                error={errors?.start_date}
              />
              <TextInput
                label="End Date"
                type="date"
                name="end_date"
                value={campaign?.end_date?.substring(0, 10) || ""}
                onChange={(e) => { setCampaign({ ...campaign, end_date: e.target.value }); }}
                error={errors?.end_date}
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={campaign?.is_active ?? true}
                onChange={(e) => setCampaign({ ...campaign, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Active</span>
            </label>
          </div>
        </Modal.Body>
        <Modal.Footer className="flex justify-between items-center gap-2">
          {campaign?.id && (
            <Button type="button" bg="bg-black" onClick={handleDelete}>Delete</Button>
          )}
          <div className="flex gap-2 ms-auto">
            <Button type="submit">{campaign?.id ? "Update" : "Save"}</Button>
          </div>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default ModalForm;
