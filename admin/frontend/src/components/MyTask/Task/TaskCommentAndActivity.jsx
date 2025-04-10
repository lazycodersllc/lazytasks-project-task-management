import {ActionIcon, Avatar, Button, Flex, Select, Text, Textarea, Title} from '@mantine/core';
import {IconChevronDown, IconPointFilled, IconTrash, IconTrashX} from '@tabler/icons-react';
import React, {Fragment, useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {createComment, deleteComment} from "../../Settings/store/taskSlice";
import dayjs from "dayjs";
import ActivityLogs from "../ActivityLogs";

const TaskCommentAndActivity = ({task, selectedValue}) => {

  const dispatch = useDispatch();

  const [comments, setComments] = useState(task && task.commentsAndLogActivities ? task.commentsAndLogActivities : []);
  const [commentText, setCommentText] = useState('');
  const {loggedUserId, name} = useSelector((state) => state.auth.user)
  const {loggedInUser} = useSelector((state) => state.auth.session)
  const dateTimeFormat = 'DD MMM YYYY hh:mm A'

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const timeDiff = Math.abs(now - commentTime) / 1000; // in seconds

    if (timeDiff < 60) {
      return 'Just now';
    } else if (timeDiff < 3600) {
      const minutes = Math.floor(timeDiff / 60);
      return `${minutes} min ago`;
    } else if (timeDiff < 86400) {
      const hours = Math.floor(timeDiff / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return commentTime.toLocaleString();
    }
  };

  const handleAddComment = () => {
    const timestamp = new Date().toISOString();
    const newComment = {
      user_id: loggedInUser ? loggedInUser.loggedUserId : loggedUserId,
      user_name: loggedInUser ? loggedInUser.name : '',
      commentable_id: task && task.id ? task.id : null,
      commentable_type: 'task',
      content: commentText,
      created_at: formatTimestamp(timestamp)
    };
    dispatch(createComment(newComment)).then((response) => {
      if(response.payload && response.payload.data){
        setComments( response.payload.task.commentsAndLogActivities );
      }
    });
    setCommentText(''); // Clear textarea
  };

  useEffect(() => {
    setComments(task && task.commentsAndLogActivities ? task.commentsAndLogActivities : []);
  } , [task.commentsAndLogActivities]);

  return (
      <Fragment>
        { selectedValue === 'Comments & Activities' &&
            <div className="write-comments pb-4">
              <div className="flex gap-2 mb-2">
                <Avatar size={32}
                        src={loggedInUser && loggedInUser.avatar ? loggedInUser.avatar : ''}
                        alt={loggedInUser && loggedInUser.name}/>
                <Textarea
                    description=""
                    style={{width: '100%'}}
                    autosize
                    minRows={4}
                    placeholder="Type your comment here"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button variant="filled" color="#39758D" size="md" onClick={handleAddComment}>Comment</Button>
              </div>
            </div>
        }

        <div className="comments-lists max-h-[400px] overflow-y-scroll scrollbar-width-thin">
          {selectedValue==='Comments & Activities' && comments && comments.length>0 && comments.map((comment, index) => (
              <div key={index} className="single-comment mb-4">
                <Flex
                    gap="xs"
                    justify="flex-start"
                    align="center"
                    direction="row"
                >
                  <Avatar size={32} src={comment.avatar} alt={comment.user_name} />
                  <Text fw={500} fz={14} c="#202020">{comment.user_name}</Text>
                  <Text fw={400} fz={12} c="#39758D"><IconPointFilled size={14} /></Text>
                  <Text fw={400} fz={12} c="#39758D">{comment.created_at ? dayjs(comment.created_at).format(dateTimeFormat) : ''}</Text>
                </Flex>
                <div className="comment-body pl-[40px]">
                  { comment.content &&
                      <Text fw={400} fz={14} c="#4D4D4D" style={{ whiteSpace: 'pre-line' }}>{comment.content || '' }</Text>
                  }
                  { comment.properties &&
                      <ActivityLogs activity={comment}  />
                  }
                </div>
              </div>
          ))}
        </div>


      </Fragment>
  );
};

export default TaskCommentAndActivity;
