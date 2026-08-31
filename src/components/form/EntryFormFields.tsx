import { useState } from "react";
import { type CalendarEntryType } from "../../types/models/CalendarEntry";
import { useLiveQuery } from "dexie-react-hooks";
import { getAllTimeSlots } from "../../db/queries/slots";
import type { EntryDbModel } from "../../db/types";
import { FormInput } from "../common/FormInput";
import { FormSelect } from "../common/FormSelect";
import * as z from "zod";

const durationOptions = [
  { label: "5 minutes", value: 5 },
  { label: "10 minutes", value: 10 },
  { label: "15 minutes", value: 15 },
  { label: "20 minutes", value: 20 },
  { label: "25 minutes", value: 25 },
  { label: "30 minutes", value: 30 },
  { label: "35 minutes", value: 35 },
  { label: "40 minutes", value: 40 },
  { label: "45 minutes", value: 45 },
  { label: "50 minutes", value: 50 },
  { label: "55 minutes", value: 55 },
  { label: "60 minutes", value: 60 },
];

const weightOptions = [
  { text: "Low", weight: 0 },
  { text: "Normal", weight: 1 },
  { text: "High", weight: 2 },
  { text: "Do ASAP", weight: 3 },
];

interface EntryFormFieldsProps {
  itemType: CalendarEntryType;
  data?: EntryDbModel;
  isViewOnly: boolean;
}

const BufferFields = ({
  bufferBefore,
  bufferAfter,
  common,
}: {
  bufferBefore: number;
  bufferAfter: number;
  common: any;
}) => (
  <div style={{ display: "flex", flexDirection: "row" }}>
    <FormInput
      label={"Buffer Before"}
      type="number"
      min="0"
      max="1440"
      name="bufferBefore"
      defaultValue={bufferBefore}
      {...common}
    />
    <FormInput
      label={"Buffer After"}
      type="number"
      min="0"
      max="1440"
      name="bufferAfter"
      defaultValue={bufferAfter}
      {...common}
    />
  </div>
);

const EventFields = ({
  data,
  dateTimeNow,
  common,
}: {
  data: EntryDbModel | undefined;
  dateTimeNow: Temporal.PlainDateTime;
  common: any;
}) => {
  const [isBusy, setIsBusy] = useState<boolean>(data?.isBusy ?? true);

  return (
    <>
      <FormInput
        label="Busy"
        type="checkbox"
        name="isBusy"
        checked={isBusy}
        onChange={(e) => setIsBusy(e.target.checked)}
      />
      <FormInput
        label="Start"
        type="datetime-local"
        name="start"
        defaultValue={data?.start ?? dateTimeNow.toString()}
        {...common}
      />
      <FormInput
        label="End"
        type="datetime-local"
        name="end"
        defaultValue={data?.end ?? dateTimeNow.toString()}
        {...common}
      />
    </>
  );
};

const TaskFields = ({
  data,
  isViewOnly,
  dateNow,
  dateTimeNow,
  common,
}: {
  data: EntryDbModel | undefined;
  isViewOnly: boolean;
  dateNow: Temporal.PlainDate;
  dateTimeNow: Temporal.PlainDateTime;
  common: any;
}) => {
  const slots = useLiveQuery(getAllTimeSlots);
  const [autoSortForm, setAutoSortForm] = useState(data?.isSortable ?? false);
  const [isBusy, setIsBusy] = useState(data?.isBusy ?? true);
  
  return (
    <>
      <FormInput
        label="Busy"
        type="checkbox"
        name="isBusy"
        checked={autoSortForm ? true : isBusy}
        onChange={(e) => setIsBusy(autoSortForm ? true : e.target.checked)}
        disabled={isViewOnly}
      />
      <input
        type="hidden"
        name="isSortable"
        disabled={isViewOnly}
        value="false"
      />
      <FormInput
        label="Auto Sort?"
        type="checkbox"
        name="isSortable"
        checked={autoSortForm}
        value="true"
        onChange={(e) => setAutoSortForm(e.target.checked)}
        disabled={isViewOnly}
      />
      {!autoSortForm ? (
        <>
          <FormInput
            label="Start"
            type="datetime-local"
            name="start"
            defaultValue={data?.start ?? dateTimeNow.toString()}
            {...common}
          />
          <FormInput
            label="End"
            type="datetime-local"
            name="end"
            defaultValue={data?.end ?? dateTimeNow.toString()}
            {...common}
          />
        </>
      ) : (
        <FormSelect
          label="Duration"
          name="duration"
          defaultSelected={
            (data && fromISODuration(data.duration)) ?? 25
          }
          options={durationOptions}
          {...common}
        />
      )}
      <div style={{ display: "flex", flexDirection: "row" }}>
        {weightOptions.map((w) => {
          return (
            <FormInput
              key={w.weight}
              label={w.text}
              type="radio"
              name="weight"
              value={w.weight}
              defaultChecked={data?.weight === w.weight || w.text === "Normal"}
              {...common}
            />
          );
        })}
      </div>
      {autoSortForm && (
        <>
          <FormSelect
            label="Timeslots"
            name="slotId"
            defaultSelected={data?.slotId}
            options={
              (slots?.ok &&
                slots.data.map((s) => {
                  return { label: s.name, value: s.id };
                })) ||
              []
            }
            {...common}
          />

          <FormInput
            label="Can be started on"
            type="datetime-local"
            name="startDate"
            defaultValue={
              data?.startDate ??
              dateNow.toPlainDateTime().toString({ smallestUnit: "minutes" })
            }
            {...common}
          />
          <FormInput
            label="Due by"
            type="datetime-local"
            name="dueDate"
            defaultValue={
              data?.dueDate ??
              dateNow
                .toPlainDateTime({ hour: 23, minute: 59 })
                .toString({ smallestUnit: "minutes" })
            }
            {...common}
          />
        </>
      )}
    </>
  );
};

const fromISODuration = (duration: string) => {
  const iso = z.object({ duration: z.iso.duration() });
  const x = iso.safeParse({duration});
  if (x.error) return;
  return Temporal.Duration.from(x.data.duration).minutes;
};

export const EntryFormFields = ({
  itemType,
  data,
  isViewOnly,
}: EntryFormFieldsProps) => {
  const dateNow = Temporal.Now.plainDateISO();
  const dateTimeNow = Temporal.Now.plainDateTimeISO().round("minute");
  const common = { required: true, disabled: isViewOnly };

  return (
    <>
      <FormInput
        label="Name"
        type="text"
        name="name"
        defaultValue={data?.name}
        {...common}
      />

      {itemType === "task" ? (
        <TaskFields
          data={data}
          isViewOnly={false}
          dateNow={dateNow}
          dateTimeNow={dateTimeNow}
          common={common}
        />
      ) : (
        <EventFields data={data} dateTimeNow={dateTimeNow} common={common} />
      )}

      <BufferFields
        bufferBefore={(data && fromISODuration(data.bufferBefore)) ?? 0}
        bufferAfter={(data && fromISODuration(data.bufferAfter)) ?? 0}
        common={common}
      />

      <label htmlFor="notes">Notes</label>
      <textarea name="notes" id="notes" defaultValue={data?.notes} {...common}></textarea>
    </>
  );
};
