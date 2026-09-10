import { useCallback, useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { parse, format, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { CreateTimeslotButton } from "./components/button/CreateTimeslots";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db/db";
import { getWeekBounds } from "./utils/getWeekBounds";
import type { EntryDbModel } from "./db/types";
import { CreateEntryButton } from "./components/button/CreateEntryButton";
import { SortTasksButton } from "./components/SortTasksButton";
import { CustomEvent } from "./components/common/CustomEvent";
import { ViewUnsortedTasksButton } from "./components/ViewUnsortedTasks";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

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

  const events = useLiveQuery(
    () =>
      db.events
        .filter((e) => (e.start ? e.start >= startOfWeek.toString() && e.start <= endOfWeek.toString() : false))
        .toArray(),
    [startOfWeek, endOfWeek],
  );

  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  return (
    <>
      <CreateEntryButton />
      <CreateTimeslotButton />
      <ViewUnsortedTasksButton></ViewUnsortedTasksButton>
      <SortTasksButton /> 

      <Calendar
        events={events ? events : undefined}
        defaultView={Views.WEEK}
        timeslots={3}
        step={5}
        min={new Date(Temporal.Now.plainDateTimeISO().with({ hour: 5, minute: 0 }).toString())}
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
