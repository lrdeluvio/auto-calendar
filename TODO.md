- [x] button for creating events
- [x] pop up modal that shows unsorted tasks
- [x] buttons for calendar navigation
- [x] make tasks actually completable
  - [x] BUG: events also have the checkboxes for completables
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
- [ ] allow the dialogs to be closable when clicking outside the dialog
- [x] allow items to de deletable
- [x] implement the update event forms function
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
- [x] add a isBusy toggle on events
- [x] add default value on the form
- [x] BUG: seems that tasks saving is not working properly and displays missing weight and buffer
- [x] BUG: buffer BEFORE not working.
- [ ] Add check for dates, like end > start, etc.

/_
FLOW:
db(EntryDbModel) => components(EntryDbModel) => Forms(primive) => logic(Entry) => Forms(primitive)
_/

- [x] Theres a now a bug on the sorting algorithm, i think it has something to do with
the start and due dates, because before it only receives datetime, with the time being 00
but now it receives datetime where the time can be any time. so check that. but first check whats
actually getting received by the algorithm (in agenda and sortTask)

- [ ] add zod validation on dates (like start > end check) on event/taskFromForm
- [x] now work on reimpleneting the clickable events on the calendar,
  use NiceModals!!
- [x] bug: auto tasks still being sorted inside manual tasks (probably because it has isBusy = false)

# ENTITIES
## Core (Sorting Algorithm)
- CalendarEvent
- CalendarTask
- CalendarTaskUnscheduled
- Entry = CalendarEvent | CalendarTask | CalendarTaskUnscheduled
  - Uses Temporal object for dates
## DB
- EntryDBModel
  - Uses primative types like strings, and booleans
## Form
- EntryFormModel
  - Because not everything translate properly in input elements
    Like a checkbox will return "on" or nothing at all, you want ISO duration but you get plain numbers.

- [x] creating events and turning off isBusy enables it anyway
  I thought the problem was the input element, and it was. Turns out I have separate isBusy for 
  events and tasks. It was the problem, but theres something else that's causing it.
  sorting algo might have something to do with it.
- [x] custom event colors
- [x] make calendar item duplicatable
- [ ] BUG: old entries (not from the current week, are not being shown.)
  possible fix: on the Calendar component, I should add all the previous events from the db
- [ ] BUG: if a task is sorted near the currentTime, and it is after a busy event, if we
  give it a bufferAfter, it will ignore the busy event in terms of adding the buffer.
  EX: currenTime = 2:00
      task = 2:00-2:15
      event = 2:20-2:25
      if we give the task a bufferAfter of 20 minutes, it would not be moved, and instead
      it's buffer will go straight through the event. I think. must be an algirithm bug.
- [x] BUG: the finish task early function thingy is a bit buggy, like i keep having to reload sometimes
  I think it have something to do with the current time being used. Maybe there is some way to sync it with
  the calendar?
  - [x] BUG: it won't even work if there is an event above it, i think.
  I think it's more of tasks being AFTER the current time, tasks BEFORE the current time works fine.
- [x] BUG: on creating tasks, setting weight to low makes the create button do nothing.
- [ ] BUG: I just realized this now, idk if it is a bug yet though, so when we clone an entry,
  we pass everything to the form, including the original's id, so in theory the clone is using 
  the original's id. Though at the same time, when creating new entries, we are assigning
  them new ids.
- [x] the start on dateTime is not working as intended, specifically the time part. It seems that 
  it won't be included on the tasks to sort. I think the problem is in sortTasks()
  - I think this is talking about the can be started on input? i forgot.
- [x] the sorting algorithm is buggy in general!
  I have task A which is in morning slot with normal weight, then another with
  task B which is in all day with normal weight, but then if i change the weight of task B
  to high, it will then get rid of task B, making it unsorted.
- [ ] reimplement the view unsorted tasks modal
- [ ] make the duration input maybe just numbers OR a combination of input number and input dropdown.
- [ ] BUG: updating weight to low is not doing anything. updating to high or ASAP works fine though. I mean it DOES work, idk why I wrote this. Might have inadvertandly fixed it idk.
- [ ] BUG: the cloning entries still has a few bugs

USE THE DEBUGGER, since u can just export your calendar data here in json, via the plugin
just use that

- [ ] BUG: I think the can be started, specifically the time part is not working properly.
  THEORY: I think it is, but only one task at a time of the same start time???
- [ ] BUG: So I have a whole bunch of tasks right? set on whole day, so they start at 6:00
  the I create a morning task, and it was assigned at 11AM even though the slots cutoff is 9AM
  - still happening.
  ohhhhhhhhhh i think its ebcause of the conflict resolver! since we used the start of slot a
  and the max(end of slot a or b), if our end is slob b (which is higher) tasks from slot a
  can be sorted outside of its range. 
  we can;t just use slot a's end all the time because then there will be a gap for the tasks
  of slot b.
  so we either: add an options object parameter in scheduleTasksInSlot, something like 
  resolveConflict: boolean, and if it is true, a check will be triggered to see 
  wait hmmmm idkk, maybe we can just oohhhh i know we can just duplicate scheduleTasksInSlot
  but modify it so that there is a check to see if slotA's task will make it past its og end.
  and then to avoid code duplication, we should make each part of scheduleTasksInSLot into functions!!!
- [ ] in scheduleTaskInSlot:
  maybe this should't immediately stop the scheduuling?
  because what if there are still tasks that can fit on the remaining time?
  something like this:
  ```
  const durationLeftInSlot = durationOfSlot - currentTime
  const tasksFitInDuration = remainingTasks.map((t) => t.duration <= durationLeftInSlot)
  schedule(tasksFitInDuration, currentTime, sortedTasks, [...overdueTasks, currentTask, !tasksFitInDuration])
  ````
       

-----
# FEAURE IDEA
A stress meter you can increase or decrease when creating tasks

I can then create an algorithm that changes the sorting algorithm based on
stress meter.

There will be a couple of methods of handling tasks based on stess:
Swallow the frog - stressful tasks first
Easy tasks first
Alternating between stressful and easy tasks

------



