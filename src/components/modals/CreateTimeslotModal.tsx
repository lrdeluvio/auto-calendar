import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { addTimeSlot } from "../../db/queries/slots";
import { Modal } from "../common/Modal";
import * as z from "zod";
import type { Result } from "../../types/common";

const timeslotFormModel = z.object({
  name: z.string(),
  start: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .transform((time) => `${time}:00`),
  end: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .transform((time) => `${time}:00`),
});

const createTimeslotFromForm = async (data: FormData): Promise<Result<string, string>> => {
  const parseResult = timeslotFormModel.safeParse(Object.fromEntries(data));
  if (parseResult.error) return { ok: false, error: JSON.stringify(parseResult.error) };

  const { name, start, end } = parseResult.data;
  const saveResult = await addTimeSlot({
    name: name,
    start: Temporal.PlainTime.from(start),
    end: Temporal.PlainTime.from(end),
  });

  if (!saveResult.ok) return saveResult;
  return saveResult;
};

export const CreateTimeslotModal = NiceModal.create(() => {
  const modal = useModal();
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await createTimeslotFromForm(formData);

    if (!result.ok) {
      alert(result.error);
      return;
    } else modal.hide().then(() => modal.remove());
  };

  return (
    <Modal>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input type="text" name="name" id="name" required />

        <label htmlFor="start">start</label>
        <input type="time" name="start" id="start" min="0" max="1440" required />

        <label htmlFor="end">end</label>
        <input type="time" name="end" id="end" min="0" max="1440" required />

        <button type="submit">Create</button>
      </form>
      <button onClick={() => modal.hide()}>Close</button>
    </Modal>
  );
});
