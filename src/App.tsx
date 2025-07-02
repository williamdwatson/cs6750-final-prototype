// Some of this code is taken from https://github.com/christopher-caldwell/react-big-calendar-demo/blob/56a8e0493ccdc80accf379ac74907d0c53323ef3/src/App.tsx

import { useRef, useState, type FormEvent } from "react";

// Date FNS
import { enUS } from "date-fns/locale/en-US";
import { format } from "date-fns/format";
import { getDay } from "date-fns/getDay";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";

// react-big-calendar
import { Calendar, dateFnsLocalizer, type Event } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";

// PrimeReact
import { Button } from "primereact/button";
import { Calendar as FormCalendar} from "primereact/calendar";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { SelectButton } from "primereact/selectbutton";
import { Toast } from "primereact/toast";

// Stylesheets
import "primeicons/primeicons.css";
import "primereact/resources/themes/mdc-light-deeppurple/theme.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-US": enUS,
};
const start = new Date(2025, 6, 1, 15)
const DnDCalendar = withDragAndDrop(Calendar);

export default function App() {
  const [addVisible, setAddVisible] = useState(false);
  const [timerVisible, setTimerVisible] = useState(false);
  const [which, setWhich] = useState<"Task"|"Meeting">("Task");
  const [eventName, setEventName] = useState("");
  const [fromDate, setFromDate] = useState<Date|null|undefined>(new Date());
  const [toDate, setToDate] = useState<Date|null|undefined>(new Date());
  const [seconds, setSeconds] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const [selectedProject, setSelectedProject] = useState("Project 1");
  const [showInfo, setShowInfo] = useState(false);
  // Default tasks/projects
  const [events, setEvents] = useState<Event[]>([
    {
      title: "Project 1 Task 1",
      start: new Date(2025, 5, 30, 8),
      end: new Date(2025, 5, 30, 9, 30),
    },
    {
      title: <>Project 2 (meeting) <i className="pi pi-calendar"/></>,
      start: new Date(2025, 5, 30, 9, 30),
      end: new Date(2025, 5, 30, 10, 30),
    },
    {
      title: "Project 1 Task 2",
      start: new Date(2025, 5, 30, 10, 30),
      end: new Date(2025, 5, 30, 11, 30),
    },
    {
      title: "Lunch",
      start: new Date(2025, 5, 30, 11, 30),
      end: new Date(2025, 5, 30, 12, 30),
    },
    {
      title: "Project 2 Task 1",
      start: new Date(2025, 5, 30, 12, 30),
      end: new Date(2025, 5, 30, 16),
    },
    {
      title: "Project 2 Task 2",
      start: new Date(2025, 5, 30, 16),
      end: new Date(2025, 5, 30, 17),
    },
    {
      title: "Project 2 Task 2",
      start: new Date(2025, 6, 1, 8),
      end: new Date(2025, 6, 1, 11),
    },
    {
      title: "Project 2 Task 3",
      start: new Date(2025, 6, 1, 11),
      end: new Date(2025, 6, 1, 12, 30),
    },
    {
      title: "Lunch",
      start: new Date(2025, 6, 1, 12, 30),
      end: new Date(2025, 6, 1, 13, 30),
    },
    {
      title: "Project 1 Task 2 (ongoing)",
      start: new Date(2025, 6, 1, 13, 30),
      end: new Date(2025, 6, 1, 15, ),
    },
    {
      title: "Project 1 Task 3 (planned)",
      start: new Date(2025, 6, 2, 8, ),
      end: new Date(2025, 6, 2, 11, 30),
    },
    {
      title: "Lunch (planned)",
      start: new Date(2025, 6, 2, 11, 30),
      end: new Date(2025, 6, 2, 12, 30),
    },
    {
      title: <>Project 3 (meeting) <i className="pi pi-calendar"/></>,
      start: new Date(2025, 6, 3, 13, ),
      end: new Date(2025, 6, 3, 14, 30),
      resource: 3,
    },
  ]);
  const toast = useRef<Toast>(null);
  const timer = useRef<number>(null);

  /**
   * Callback when an event is expanded or shrunk
   * @param data Event data
   */
  const onEventResize = (data: any) => {
    const idx = events.findIndex(e => e.title === data.event.title);
    const new_events = [...events];
    new_events[idx].start = data.start as Date;
    new_events[idx].end = data.end as Date;
    setEvents(new_events);
  }

  /**
   * Callback when an event is dragged and dropped
   * @param data Event data
   */
  const onEventDrop = (data: any) => {
    const idx = events.findIndex(e => e.title === data.event.title);
    const new_events = [...events];
    new_events[idx].start = data.start as Date;
    new_events[idx].end = data.end as Date;
    setEvents(new_events);
  }

  /**
   * Callback when a portion of the calendar is selected (to add an new event)
   * @param data Selected calendar data
   */
  const onSelectEvent = (data: any) => {
    setFromDate(data.start);
    setToDate(data.end);
    setAddVisible(true);
  }

  /**
   * Gets the style for the given event
   * @param event Event to style
   * @returns Style for the `event`
   */
  const propGetter = (event: Event) => {
    if (event.title?.toString().includes("Lunch")) {
      if (event.start! > start) {
        return {style: {backgroundColor: "rgba(161, 111, 255, 0.58)"}};
      }
      return {style: {backgroundColor: "purple",}};
    }
    else if (event.title?.toString().includes("Project 2")) {
      if (event.start! > start) {
        return {style: {backgroundColor: "yellow"}};
      }
      return {style: {backgroundColor: "goldenrod",}};
    }
    else if (event.resource === 3) {
      return {style: {backgroundColor: "rgba(102, 158, 64, 0.58)"}};
    }
    if (event.start! > start) {
        return {style: {backgroundColor: "rgba(111, 145, 255, 0.58)"}};
      }
    return {};
  }

  /**
   * Gets the style for a given day
   * @param day Day to style
   * @returns Style for the `day`
   */
  const dayPropGetter = (day: Date) => {
    if (day < new Date(2025, 6, 1)) {
      return {style: {backgroundColor: "grey"}};
    }
    return {};
  }

  /**
   * Gets the style for a given slot of time
   * @param slot Slot of time to style
   * @returns Style for the `slot`
   */
  const slotPropGetter = (slot: Date) => {
    if (slot.getHours() <= 7 || slot.getHours() >= 17) {
      return {style: {backgroundColor: "lightgrey"}};
    }
    return {};
  }

  /**
   * Actually adds a new event
   */
  const doAddEvent = () => {
    console.log(which);
    setEvents([
      ...events,
      {
        title: eventName + (which === "Task" ? " (planned)" : eventName.toLowerCase().includes("meeting") ? "" : " (meeting)"),
        start: fromDate!,
        end: toDate!
      }
    ]);
    cancel();
  }

  /**
   * Cancels the adding of a new event
   */
  const cancel = () => {
    setAddVisible(false);
    setEventName("");
    setFromDate(new Date());
    setToDate(new Date());
  }

  /**
   * Potentially saves a new event
   * @param e Form submit event
   */
  const saveEvent = (e: FormEvent) => {
    e.preventDefault();
    if (fromDate! > toDate!) {
      toast.current?.show({severity: "warn", summary: "Invalid time", detail: "The start time must be before the end time"});
    }
    else if (eventName.trim() === "") {
      toast.current?.show({severity: "warn", summary: "Missing name", detail: `The ${which.toLowerCase()} must be named`})
    }
    else if (events.some(e => (e.start! < fromDate! && fromDate! < e.end!) || (e.start! < toDate! && toDate! < e.end!))) {
      confirmDialog({
            message: "This event overlaps with an existing one. Do you want to add it?",
            header: "Overlapping event",
            icon: "pi pi-info-circle",
            acceptClassName: "p-button-danger",
            accept: doAddEvent,
        });
    }
    else if (fromDate!.getHours() < 8) {
      confirmDialog({
            message: "This event starts before your usual work day. Do you want to add it?",
            header: "Early event",
            icon: "pi pi-info-circle",
            acceptClassName: "p-button-danger",
            accept: doAddEvent,
        });
    }
    else if (toDate!.getHours() > 17) {
      confirmDialog({
            message: "This event ends after your usual work day. Do you want to add it?",
            header: "Late event",
            icon: "pi pi-info-circle",
            acceptClassName: "p-button-danger",
            accept: doAddEvent,
        });
    }
    else {
      doAddEvent();
    }
  }

  /**
   * Callback for every timer tick (simply increments the counter)
   */
  const tickTimer = () => {
    setSeconds(prev => prev+1);
  }

  /**
   * Toggles whether the timer is started
   */
  const toggleTimer = () => {
    if (timerStarted) {
      setTimerStarted(false);
      clearInterval(timer.current!);
    }
    else {
      setTimerStarted(true);
      timer.current = setInterval(tickTimer, 1000);
    }
  }

  return (
    <div>
      <Toast ref={toast}/>
      <ConfirmDialog />
      <Dialog header="About" visible={showInfo} onHide={() => setShowInfo(false)} dismissableMask>
        <p>This is the final project prototype for William Watson (<a href="mailto:wwatson43@gatech.edu">wwatson43@gatech.edu</a>) for Georgia Tech class CS6750 Human Computer Interaction.</p>
        <p>The video walkthrough is available at <a href="https://youtu.be/6IKHLS1aIg4" target="_blank">https://youtu.be/6IKHLS1aIg4</a></p>
        <p>
          This prototype uses the following libraries or portions of code from them, all under the MIT license:
          <ul>
            <li><cite>react-big-calendar</cite> by Jason Quense, Stephen Blades, Bogdan Chadkin, and Tobias Andersen at <a href="https://github.com/jquense/react-big-calendar" target="_blank">https://github.com/jquense/react-big-calendar</a></li>
            <li><cite>react-big-calendar-demo</cite> by Christopher Caldwell at <a href="https://github.com/christopher-caldwell/react-big-calendar-demo" target="_blank">https://github.com/christopher-caldwell/react-big-calendar-demo</a></li>
            <li><cite>PrimeReact</cite> by the PrimeFaces organization at <a href="https://primereact.org" target="_blank">https://primereact.org</a></li>
            <li><cite>vite-plugin-singlefile</cite> by Richard Tallent at <a href="https://github.com/richardtallent/vite-plugin-singlefile" target="_blank">https://github.com/richardtallent/vite-plugin-singlefile</a></li>
          </ul>
        </p>
        <p>The prototype was built using <a href="https://typescriptlang.org" target="_blank">TypeScript</a>/<a href="https://react.dev" target="_blank">React</a> with the <a href="https://vite.dev" target="_blank">Vite</a> frontend build tool.</p>
        <p>Note that not all pieces are functional - the liver timer doesn't actually record to the calendar, for example, and items cannot be deleted from the calendar.</p>
      </Dialog>
      <Dialog header="Add item" visible={addVisible} onHide={cancel}>
        <form onSubmit={saveEvent}>
          <div style={{textAlign: "center"}}>
            <SelectButton value={which} onChange={e => setWhich(e.value)} options={["Task", "Meeting"]}/>
          </div>
          <div style={{marginTop: "10px"}}>
            <label htmlFor="name">Name:</label> <InputText value={eventName} onChange={e => setEventName(e.target.value)} id="name"/>
          </div>
            {which === "Task" ? null
            : <div style={{marginTop: "5px"}}>
              <label htmlFor="participants">Participants:</label> <InputText id="participants"/>
              </div>}
            <div style={{marginTop: "5px"}}>
              <label htmlFor="from-date">From:</label> <FormCalendar value={fromDate} onChange={e => setFromDate(e.value)} showTime inputId="from-date"/>
            </div>
            <div style={{marginTop: "5px"}}>
              <label htmlFor="to-date">To:</label> <FormCalendar value={toDate} onChange={e => setToDate(e.value)} showTime inputId="to-date"/>
            </div>
            <div style={{marginTop: "15px", textAlign: "center"}}>
              <Button type="submit" label="Save" icon="pi pi-save" severity="success"/>
              <Button type="reset" label="Cancel" icon="pi pi-times" style={{marginLeft: "5px"}} onClick={cancel}/>
            </div>
        </form>
      </Dialog>
      <Dialog header="Live timer" visible={timerVisible} onHide={() => setTimerVisible(false)}>
        <div style={{textAlign: "center"}}>
          <label style={{marginRight: "5px"}} htmlFor="project">Project:</label>
          <Dropdown value={selectedProject} onChange={e => setSelectedProject(e.value)} options={["Project 1", "Project 2"]} disabled={seconds > 0 || timerStarted} inputId="project"/>
        </div>
        <div style={{textAlign: "center", fontWeight: "bolder", fontSize: "2.5em", marginTop: "5px", marginBottom: "5px"}}>{(seconds / 3600).toFixed().padStart(2, "0")}:{(seconds / 60).toFixed().padStart(2, "0")}:{(seconds % 60).toFixed().padStart(2, "0")}</div>
        <div style={{textAlign: "center"}}>
          <Button label={timerStarted ? "Pause" : "Start"} icon={`pi pi-${timerStarted ? "pause" : "play"}`} rounded outlined severity={timerStarted ? "warning" : "success"} onClick={toggleTimer}/>
          <Button label="Done" icon="pi pi-stop" rounded outlined severity="danger" style={{marginLeft: "5px"}} onClick={() => {setSeconds(0); setTimerVisible(false); setTimerStarted(false); clearInterval(timer.current!)}}/>
        </div>
      </Dialog>
      <div style={{textAlign: "center", marginBottom: "5px"}}>
        <Button label="Add item" icon="pi pi-plus" onClick={() => setAddVisible(true)} style={{marginRight: "15px"}}/>
        <Button label="View timer" icon="pi pi-clock" severity="secondary" onClick={() => setTimerVisible(true)}/>
        <Button icon="pi pi-info-circle" rounded severity="info" onClick={() => setShowInfo(true)} style={{float: "right"}}/>
      </div>
    <DnDCalendar
      defaultView="week"
      events={events}
      localizer={dateFnsLocalizer({
        format,
        parse,
        startOfWeek,
        getDay,
        locales,
      })}
      onEventDrop={onEventDrop}
      onEventResize={onEventResize}
      onSelectSlot={onSelectEvent}
      eventPropGetter={propGetter}
      dayPropGetter={dayPropGetter}
      slotPropGetter={slotPropGetter}
      getNow={() => start}
      views={["month", "week"]}
      resizable
      selectable
      style={{ height: "93vh" }}
    />
    </div>
  )
}
