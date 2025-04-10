import React, { useState, useRef, useEffect } from 'react';
import { Calendar } from '@mantine/dates';
import { IconCalendarEvent } from '@tabler/icons-react';
import '@mantine/dates/styles.css';
import {useDispatch, useSelector} from "react-redux";
import dayjs from "dayjs";
import {editMyTask} from "../../Settings/store/myTaskSlice";
import {hasPermission} from "../../ui/permissions";
import { Tooltip } from "@mantine/core";

const formatDate = (date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const dbdateFormate = (date) => {
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  let formattedDate = new Date(date).toLocaleDateString('en-US', options);

  // Remove the comma after the day
  formattedDate = formattedDate.replace(',', '');

  const [month, day, year] = formattedDate.split(' ');
  return `${day}-${month}-${year}`;
};

 


// const inputDate = new Date("2024-02-05");
// const options = { day: 'numeric', month: 'short', year: 'numeric' };
// const formattedDate = inputDate.toLocaleDateString('en-US', options);

// console.log(formattedDate); // Output: 5-Feb-2024


const TaskDueDate = ({ taskId, dueDate}) => {
  const dispatch = useDispatch();

  // const [selectedDate, setSelectedDate] = useState(dueDate ? new Date(dueDate) : null );
  const [selectedDates, setSelectedDates] = useState([]);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const calendarRef = useRef(null);
  const {loggedUserId} = useSelector((state) => state.auth.user)
  const {loggedInUser} = useSelector((state) => state.auth.session)

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Initialize selectedDates with dueDate
  useEffect(() => {
    if (dueDate) {
      setSelectedDates([new Date(dueDate)]);
    }
  }, [dueDate]);

  const handleSelect = (date) => {
    const isSelected = selectedDates.some((selectedDate) => dayjs(date).isSame(selectedDate, 'date'));
    // Toggle selection
    if (isSelected) {
      setSelectedDates([]);
    } else {
      setSelectedDates([date]);
    }
    if(taskId && taskId !== 'undefined' && date){
      // var formatedDate = dayjs(date).format('YYYY-MM-DD');
      const formattedDate = isSelected ? null : dayjs(date).format('YYYY-MM-DD');
      dispatch(editMyTask({id: taskId, data: {start_date: formattedDate, end_date: formattedDate, 'updated_by': loggedInUser ? loggedInUser.loggedUserId : loggedUserId }})).then((response) => {
        // setSelectedDate(date);
        setCalendarVisible(false); // Hide calendar after selecting a date
      });
    }
  };

  useEffect(() => {
    // setSelectedDate(dueDate ? new Date(dueDate) : null);
  }, [dispatch, dueDate]);
  const handleClickOutside = (event) => {
    if (calendarRef.current && !calendarRef.current.contains(event.target)) {
      setCalendarVisible(false); // Hide calendar when clicking outside of it
    }
  };

  const toggleCalendar = () => {
    setCalendarVisible(!calendarVisible);
  };

  const handleCalendarClick = (event) => {
    event.stopPropagation(); // Prevents the click event from bubbling up to the parent
  };

  return (
    <div className="due-select-btn cursor-pointer" onClick={toggleCalendar}>
      <Tooltip label={`Due Date`} position="top" withArrow>
        {selectedDates.length > 0 ? (
          <div className="due-selected text-[#202020] font-medium text-[14px] cursor-pointer" onClick={toggleCalendar}>
            {selectedDates.length > 0 && formatDate(selectedDates[0])} {/* Render formatted dates */}
          </div>
        ) : (
          dueDate === null ? (
            <div className="h-[30px] w-[30px] border border-dashed border-[#202020] rounded-full p-1 cursor-pointer" onClick={toggleCalendar}>
              <IconCalendarEvent color="#4d4d4d" size="20" stroke={1.25} />
            </div>
          ) : (
            <div className="due-selected text-[#202020] font-medium text-[14px] cursor-pointer" onClick={toggleCalendar}>
              {dbdateFormate(dueDate)}
            </div>
          )
        )}
      </Tooltip>

      {calendarVisible && hasPermission(loggedInUser && loggedInUser.llc_permissions, ['superadmin', 'admin', 'director', 'manager', 'line_manager', 'employee', 'task-edit']) && (
        <div ref={calendarRef} className="absolute bg-white border border-solid border-[#6191A4] rounded-sm p-2 z-[9]" onClick={handleCalendarClick}>
          <Calendar
            getDayProps={(date) => ({ 
              selected: selectedDates.some((selectedDate) => dayjs(date).isSame(selectedDate, 'date')),
              onClick: () => handleSelect(date),
            })}
          />
        </div>
      )}
    </div>
  );
};

export default TaskDueDate;
