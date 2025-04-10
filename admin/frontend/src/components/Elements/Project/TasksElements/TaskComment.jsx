import {ActionIcon, Avatar, Button, Flex, Select, Text, Textarea, Title} from '@mantine/core';
import {IconChevronDown, IconPointFilled, IconTrash, IconTrashX} from '@tabler/icons-react';
import React, {Fragment, useEffect, useState} from 'react';
import { useDisclosure } from '@mantine/hooks';
import {useDispatch, useSelector} from "react-redux";
import {createComment, deleteComment} from "../../../Settings/store/taskSlice";
import {useEditor} from "@tiptap/react";
import {modals} from "@mantine/modals";
import {hasPermission} from "../../../ui/permissions";
import dayjs from "dayjs";

const TaskComment = ({task, selectedValue}) => {

  const dispatch = useDispatch();

  const [comments, setComments] = useState(task && task.comments ? task.comments : []);
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
      user_id: loggedUserId,
      user_name: name,
      commentable_id: task && task.id ? task.id : null,
      commentable_type: 'task',
      content: commentText,
      created_at: formatTimestamp(timestamp)
    };
    dispatch(createComment(newComment)).then((response) => {
        if(response.payload && response.payload.data){
          setComments([response.payload.data, ...comments]);
        }
    });
    setCommentText(''); // Clear textarea
  };
  useEffect(() => {
    setComments(task && task.comments ? task.comments : []);
  } , [task.comments]);

  const commentDeleteHandler = (commentId) => modals.openConfirmModal({
    title: (
        <Title order={5}>Are you sure this comment delete?</Title>
    ),
    size: 'sm',
    radius: 'md',
    withCloseButton: false,
    children: (
        <Text size="sm">
          This action is so important that you are required to confirm it with a modal. Please click
          one of these buttons to proceed.
        </Text>
    ),
    labels: { confirm: 'Confirm', cancel: 'Cancel' },
    onCancel: () => console.log('Cancel'),
    onConfirm: () => {
      if(commentId && commentId!=='undefined'){
        dispatch(deleteComment({id: commentId, data: {'deleted_by': loggedUserId}})).then((response) => {
            if(response.payload && response.payload.data){
                setComments(comments.filter(comment => comment.id !== response.payload.data.id));
            }
        });
      }
    },
  });


  return (
    <Fragment>
      {selectedValue === 'Only Comments' &&
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
        {selectedValue==='Only Comments' && comments && comments.length>0 && comments.map((comment, index) => (
            <div key={index} className="single-comment mb-4">
              <Flex
                  gap="xs"
                  justify="flex-start"
                  align="center"
                  direction="row"
              >
                <Avatar size={32} src={comment.avatar} alt={comment.user_name} />
                <Text fw={500} fz={16} c="#202020">{comment.user_name}</Text>
                {/* <Text fw={400} fz={12} c="#39758D"><IconPointFilled size={14} /></Text> */}
                
                { ( hasPermission(loggedInUser && loggedInUser.llc_permissions, [ 'superadmin', 'admin', 'director' ] ) || parseInt( loggedUserId ) === parseInt(comment.user_id) ) &&
                    <ActionIcon onClick={()=>commentDeleteHandler(comment && comment.id)} variant="transparent" aria-label="Delete">
                      <IconTrash size={16} stroke={1} color="var(--mantine-color-red-filled)"/>
                    </ActionIcon>
                }
              </Flex>
              <div className="comment-body pl-[40px]">
                <Text fw={400} fz={14} c="#4D4D4D" style={{ whiteSpace: 'pre-line' }}>{comment.content}</Text>
                <Text fw={400} fz={12} c="#39758D">{comment.created_at ? dayjs(comment.created_at).format(dateTimeFormat) : ''}</Text>
              </div>
            </div>
        ))}
      </div>


    </Fragment>
  );
};

export default TaskComment;
