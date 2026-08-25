import { useCallback, useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { parse, format, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { CreateTimeslotButton } from "./components/CreateTimeslots";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db/db";
import { getWeekBounds } from "./utils/getWeekBounds";
import type { EntryDbModel } from "./db/types";
import { ViewUnsortedTasksButton } from "./components/ViewUnsortedTasks";
import { CreateEntryButton } from "./components/CreateCalendarItem";
import { SortTasksButton } from "./components/SortTasksButton";
import { EntryFormFields } from "./components/form/EntryFormFields";
import { EntryForm } from "./components/form/EntryForm";
import { updateTaskFromForm } from "./components/form/taskFromForm";
import { CustomEvent } from "./components/common/CustomEvent";
import { DeleteEntryButton } from "./components/DeleteEntryButton";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

/*
I should drop the use of pop up dialogs for now. Instead I was thinking
of maybe just using a pagination system for now which is much more
simpler I think. 
*/

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { startOfWeek, endOfWeek } = getWeekBounds(
    Temporal.PlainDate.from({
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      day: currentDate.getDate(),
    }),
    2,
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
      {/* <CreateEntryButton defaultItemType={"event"} /> */}
      {/* <CreateTimeslotButton></CreateTimeslotButton>
      <ViewUnsortedTasksButton></ViewUnsortedTasksButton>
      <SortTasksButton /> */}

      {/* <EntryDialog>
        {entry && (
          <EntryForm
            mode="edit"
            data={entry}
            updateFormAction={(formData, entry) =>
              updateTaskFromForm(formData, entry.id)
            }
          >
            <EntryFormFields
              data={entry}
              isViewOnly={false}
              itemType={entry.type}
            />
            <DeleteEntryButton
              entryId={entry.id}
              onOk={() => {
                closeDialog();
                alert("Deleted item");
              }}
            />
          </EntryForm>
        )}
      </EntryDialog> */}

      <Calendar
        events={events ? events : undefined}
        defaultView={Views.WEEK}
        timeslots={3}
        step={5}
        min={new Date(Temporal.Now.plainDateTimeISO().with({hour: 5, minute: 0}).toString())}
        localizer={localizer}
        startAccessor={(event: EntryDbModel) => new Date(event.start)}
        endAccessor={(event: EntryDbModel) => new Date(event.end)}
        date={currentDate}
        onNavigate={handleNavigate}
        components={{
          week: {
            event: (e) => <CustomEvent event={e.event} />,
          },
        }}
        formats={{ eventTimeRangeFormat: () => "" }}
      />
    </>
  );
}

export default App;
