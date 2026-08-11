import { useEffect, useState } from "react";
import { type CalendarEntryType } from "../../types/models/CalendarEntry";
import { Temporal } from "@js-temporal/polyfill";
import { useLiveQuery } from "dexie-react-hooks";
import { getAllTimeSlots } from "../../db/queries/slots";
import type { EntryDbModel } from "../../db/types";
import { FormInput } from "../common/FormInput";
import { FormSelect } from "../common/FormSelect";

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

export const EntryFormFields = ({
  itemType,
  data,
  isViewOnly,
}: EntryFormFieldsProps) => {
  const isEvent = itemType === "event";
  const isTask = itemType === "task";
  const slots = useLiveQuery(getAllTimeSlots);
  const dateNow = Temporal.Now.plainDateTimeISO().toString();
  const common = { required: true, disabled: isViewOnly };

  const [autoSortForm, setAutoSortForm] = useState<boolean>(false);

  useEffect(() => {
    if (!data || isEvent) return;
    setAutoSortForm(data.isSortable);
  }, [data?.isSortable]); 

  return (
    <>
      <FormInput
        label="Name"
        type="text"
        name="name"
        defaultValue={data?.name}
        {...common}
      />
      {isTask && (
        <FormInput
          label="Auto Sort?"
          type="checkbox"
          name="isSortable"
          checked={autoSortForm}
          onChange={(e) => setAutoSortForm(e.target.checked)}
          disabled={isViewOnly}
        />
      )}
      {isEvent || !autoSortForm ? (
        <>
          <FormInput
            label="Start"
            type="datetime-local"
            name="start"
            defaultValue={data?.start}
            {...common}
          />
          <FormInput
            label="End"
            type="datetime-local"
            name="end"
            defaultValue={data?.end}
            {...common}
          />
        </>
      ) : (
        <FormSelect
          label="Duration"
          name="duration"
          defaultValue={25}
          options={durationOptions}
          {...common}
        />
      )}
      {isTask && (
        <>
          <div style={{ display: "flex", flexDirection: "row" }}>
            {weightOptions.map((w) => {
              return (
                <FormInput
                  key={w.weight}
                  label={w.text}
                  type="radio"
                  name="weight"
                  defaultChecked={
                    data?.weight === w.weight || w.text === "Normal"
                  }
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
                defaultValue={data?.slotId}
                options={
                  (slots?.ok &&
                    slots.data.map((s) => ({ label: s.name, value: s.id }))) ||
                  []
                }
                {...common}
              />

              <FormInput
                label="Can be started on"
                type="date"
                name="startDate"
                defaultValue={data?.startDate?.slice(0, 10)}
                {...common}
              />
              <FormInput
                label="Due by"
                type="date"
                name="dueDate"
                defaultValue={data?.dueDate?.slice(0, 10)}
                {...common}
              />
            </>
          )}
        </>
      )}
      
      <div style={{ display: "flex", flexDirection: "row" }}>
        <FormInput
          label={"Buffer Before"}
          type="number"
          min="0"
          max="1440"
          name="bufferBefore"
          defaultValue={data?.bufferBefore}
          {...common}
        />
        <FormInput
          label={"Buffer After"}
          type="number"
          min="0"
          max="1440"
          name="bufferAfter"
          defaultValue={data?.bufferAfter}
          {...common}
        />
      </div>
    </>
  );
};
