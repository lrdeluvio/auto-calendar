import { useCallback, useRef, useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { parse, format, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { Temporal } from "@js-temporal/polyfill";
import { CreateTimeslotButton } from "./components/CreateTimeslots";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db/db";
import { getWeekBounds } from "./utils/getWeekBounds";
import type { EventDbModel } from "./db/types";
import { ViewUnsortedTasksButton } from "./components/ViewUnsortedTasks";
import { CreateCalendarItemButton } from "./components/CreateCalendarItem";
import { SortTasksButton } from "./components/SortTasksButton";
import { CalItemFormFields } from "./components/form/CalItemFormFields";
import { CalItemForm } from "./components/form/CalItemForm";
import { updateTaskFromForm } from "./components/form/taskFromForm";
import { CustomEvent } from "./components/common/CustomEvent";
import { DeleteCalItemButton } from "./components/DeleteCalItem";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

/*
  - [x] button for creating events
  - [x] pop up modal that shows unsorted tasks
  - [x] buttons for calendar navigation
  - [x] make tasks actually completable
    - [x] BUG: events also have the checkboxes for completables
  - [ ] custom event colors
  - [x] implement the buffer feature
  - [x] make calendar items clickable, allowing for editing
    - it will be basically using the create new task/event modal
    - I should first create a combine version of them (task and event)
    - [x] radio toggle to switch between task and event.
      - maybe i can just merge the two forms and then run a different function 
        depending on the radio state
    - [x] on event, create a checkbox for auto sorting a task or manually
      setting start and end
  - [x] when completing a task early, they should be moved to the curren time
    - (with end being the current time)
  - [ ] make calendar item duplicatable
  - [ ] allow the dialogs to be closable when clicking outside the dialog
  - [x] allow items to de deletable
  - [ ] implement the update event forms function
  - [ ] find out how repeating calendar items would work.
    - maybe we give items a recuranceId that is shared for the repeating items.
    - then an order so we know which comes first (for when we need to edit them, so only)
      upcoming items are updated not the previous items. though I guess we can just rely on
      start property on that.
    - Use RFC 5545
  - [x] possible new bug, task with due date of 08/03 was scheduled on 08/04
    - CONFIRMED, tasks are not respecting their due date. I think I know why, our events
      gets all the tasks within the week bounds, this includes those that are overdue.
      Wait, but they are STILL being scheduled, something to do with the sorting algorithm.
  - [x] BUG: other days can't be scheduled because they are also anchore to the CURRENT TIME.
    - Example: today is 07, 22:00 and I want to schedule something for tomorrow morning, but It
      won't be scheduled since it's past 6:00.
  - [x] 'BUG: Uncaught RangeError: invalid duration: 1' when changing the value of bufferAfter
  - [x] BUG: I also just realized the buffer feature won't work for events
  - [ ] NOTE: we might not need to use a lot of useState that stores calItem objects since 
    - we use useLiveQuery; https://dexie.org/docs/dexie-react-hooks/useLiveQuery()
  - [ ] BUG: on creating tasks, buffers are not being saved, I think it's on all the inputs?
  - [x] BUG huhu: it seems that future busyEvents are being referenced in the current date
   - Must have something to do in ScheduleTasks, maybe I need to filter the busyEvents per ScheduleTasksInSlotCall
   Ex: today is 08, 6:00, if theres a busy event in 09 6:00-6:30, that time won't be abailable to 08 
  - [ ] refactor names for consistency!!
*/

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [eventData, setEventData] = useState<EventDbModel | null>(null);
  const calItemModalRef = useRef<HTMLDialogElement>(null);
  const { startOfWeek, endOfWeek } = getWeekBounds(
    Temporal.PlainDate.from({
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      day: currentDate.getDate(),
    }), 2
  );

  const events = useLiveQuery(() =>
    db.events
      .filter((e) =>
        e.start
          ? e.start >= startOfWeek.toString() && e.start <= endOfWeek.toString()
          : false,
      )
      .toArray(),
  );

  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  return (
    <>
      <CreateCalendarItemButton defaultItemType={"event"} />
      <CreateTimeslotButton></CreateTimeslotButton>
      <ViewUnsortedTasksButton></ViewUnsortedTasksButton>
      <SortTasksButton />

      <dialog id={eventData?.id} ref={calItemModalRef}>
        {eventData && (
          <CalItemForm
            mode="edit"
            data={eventData}
            updateFormAction={(formData, calItem) =>
              updateTaskFromForm(formData, calItem.id)
            }
          >
            <CalItemFormFields
              data={eventData}
              isViewOnly={false}
              itemType={eventData.type}
            />
            <DeleteCalItemButton
              calItemId={eventData.id}
              onOk={() => {
                calItemModalRef.current?.close();
                alert("Deleted item");
              }}
            />
          </CalItemForm>
        )}
      </dialog>

      <Calendar
        events={events ? events : undefined}
        defaultView={Views.WEEK}
        timeslots={3}
        step={5}
        min={new Date(Temporal.Now.plainDateTimeISO().with({hour: 5, minute: 0}).toString())}
        localizer={localizer}
        startAccessor={(event: EventDbModel) => new Date(event.start)}
        endAccessor={(event: EventDbModel) => new Date(event.end)}
        date={currentDate}
        onNavigate={handleNavigate}
        components={{
          week: {
            event: (e) => <CustomEvent event={e.event} ref={calItemModalRef} />,
          },
        }}
        formats={{ eventTimeRangeFormat: () => "" }}
        onSelectEvent={(f) => setEventData(f)}
      />
    </>
  );
}

export default App;
