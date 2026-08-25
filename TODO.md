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
  - Use RFC 5544
- [x] possible new bug, task with due date of 7/03 was scheduled on 08/04
  - CONFIRMED, tasks are not respecting their due date. I think I know why, our events
    gets all the tasks within the week bounds, this includes those that are overdue.
    Wait, but they are STILL being scheduled, something to do with the sorting algorithm.
- [x] BUG: other days can't be scheduled because they are also anchore to the CURRENT TIME.
  - Example: today is 06, 22:00 and I want to schedule something for tomorrow morning, but It
    won't be scheduled since it's past 5:00.
- [x] 'BUG: Uncaught RangeError: invalid duration: 0' when changing the value of bufferAfter
- [x] BUG: I also just realized the buffer feature won't work for events
- [ ] NOTE: we might not need to use a lot of useState that stores entry objects since
  - we use useLiveQuery; https://dexie.org/docs/dexie-react-hooks/useLiveQuery()
- [x] BUG: on creating tasks, buffers are not being saved, I think it's on all the inputs?
- [x] BUG huhu: it seems that future busyEvents are being referenced in the current date
- Must have something to do in scheduleTasksInDate, maybe I need to filter the busyEvents per scheduleTasksInDateInSlotCall
  Ex: today is 7, 6:00, if theres a busy event in 09 6:00-6:30, that time won't be abailable to 08
- [x] refactor names for consistency!!
- [ ] add a isBusy toggle on events
- [x] add default value on the form
- [ ] branded types for readability: https://gemini.google.com/app/d444b8e5d85bc859
- [x] BUG: seems that tasks saving is not working properly and displays missing weight and buffer
- [ ] BUG: buffer BEFORE not working.
- [ ] Add check for dates, like end > start, etc.

/_
FLOW:
db(EntryDbModel) => components(EntryDbModel) => Forms(primive) => logic(Entry) => Forms(primitive)
_/

react-big-calendar's Calendar component is causing this warning: Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform
