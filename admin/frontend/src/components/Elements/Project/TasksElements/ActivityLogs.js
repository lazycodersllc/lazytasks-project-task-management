import React, {Fragment} from 'react'
import classNames from 'classnames'
import {Text} from "@mantine/core";

const HighlightedText = ({ children, className }) => {
    return (
        <span
            className={classNames(
                'font-semibold text-gray-900 dark:text-gray-100 whitespace-pre-line',
                className
            )}
        >
            {children}
        </span>
    )
}

const ActivityLogs = ({ activity }) => {
    const dateTimeFormat = 'DD MMM YYYY hh:mm A'

    return (
        activity.properties.attributes && Object.keys(activity.properties.attributes).length>0 && Object.keys(activity.properties.attributes).map((attrName, attrIndex)=>{
            return (
                <Fragment key={attrIndex}>

                    {activity?.subject_name==='task' && activity?.event==='created' && attrName==='name' && (
                        <div className="mt-1">
                            <HighlightedText>{activity.properties.attributes[attrName]}</HighlightedText>
                            <span className="mx-1"> is created. </span>
                        </div>
                    )}

                    {activity?.subject_name==='task' && activity?.subject_type==='comment' && attrName==='comment' && (
                        <div className="mt-1">
                            <HighlightedText>{activity.properties.attributes[attrName]}</HighlightedText>
                        </div>
                    )}

                    {activity?.subject_name==='task' && activity?.event === 'updated' &&
                        <>
                            {attrName==='name' &&
                                <div className="mt-1">
                                    <span className="mx-1">Title change: </span>
                                    <HighlightedText>{activity.properties.old[attrName]}</HighlightedText>
                                    <span className="mx-1"> to </span>
                                    <HighlightedText>{activity.properties.attributes[attrName]}</HighlightedText>
                                </div>
                            }
                            {attrName==='description' &&
                                (
                                    activity.properties.old[attrName] ? (
                                        <div className="mt-1">
                                            <span className="mx-1">Description change: </span>
                                            <HighlightedText>{activity.properties.old[attrName]}</HighlightedText>
                                            <span className="mx-1"> to </span>
                                            <HighlightedText>{activity.properties.attributes[attrName]}</HighlightedText>
                                        </div>
                                    ):(
                                        <div className="mt-1">
                                            <span className="mx-1">Description add: </span>
                                            <HighlightedText>{activity.properties.attributes[attrName]}</HighlightedText>
                                        </div>
                                    )
                                )
                            }
                            {attrName==='assignedTo_name' &&
                                (
                                    activity.properties.old[attrName] ? (
                                        <div className="mt-1">
                                            <span className="mx-1">Assigned: </span>
                                            <HighlightedText>{activity.properties.old[attrName]}</HighlightedText>
                                            <span className="mx-1"> to </span>
                                            <HighlightedText>{activity.properties.attributes[attrName]}</HighlightedText>
                                        </div>
                                    ):(
                                        <div className="mt-1">
                                            <span className="mx-1">Assigned: </span>
                                            <HighlightedText>{activity.properties.attributes[attrName]}</HighlightedText>
                                        </div>
                                    )
                                )
                            }
                            {attrName==='priority_name' &&
                                (
                                    activity.properties.old[attrName] ? (
                                        <div className="mt-1">
                                            <span className="mx-1">Priority: </span>
                                            <HighlightedText>{activity.properties.old[attrName]}</HighlightedText>
                                            <span className="mx-1"> to </span>
                                            <HighlightedText>{activity.properties.attributes[attrName]}</HighlightedText>
                                        </div>
                                    ):(
                                        <div className="mt-1">
                                            <span className="mx-1">Priority: </span>
                                            <HighlightedText>{activity.properties.attributes[attrName]}</HighlightedText>
                                        </div>
                                    )
                                )
                            }
                            {attrName==='start_date' &&
                                (
                                    activity.properties.old[attrName] ? (
                                        <div className="mt-1">
                                            <span className="mx-1">Start date change: </span>
                                            <HighlightedText>{activity.properties.old[attrName]}</HighlightedText>
                                            <span className="mx-1"> to </span>
                                            <HighlightedText>{activity.properties.attributes[attrName]}</HighlightedText>
                                        </div>
                                    ):(
                                        <div className="mt-1">
                                            <span className="mx-1">Start date: </span>
                                            <HighlightedText>{activity.properties.attributes[attrName]}</HighlightedText>
                                        </div>
                                    )
                                )
                            }
                            {attrName==='end_date' &&
                                (
                                    activity.properties.old[attrName] ? (
                                        <div className="mt-1">
                                            <span className="mx-1">Due date change: </span>
                                            <HighlightedText>{activity.properties.old[attrName]}</HighlightedText>
                                            <span className="mx-1"> to </span>
                                            <HighlightedText>{activity.properties.attributes[attrName]}</HighlightedText>
                                        </div>
                                    ):(
                                        <div className="mt-1">
                                            <span className="mx-1">Due date: </span>
                                            <HighlightedText>{activity.properties.attributes[attrName]}</HighlightedText>
                                        </div>
                                    )
                                )
                            }
                            {attrName==='section_name' &&
                                <div className="mt-1">
                                    <span className="mx-1">Section change: </span>
                                    <HighlightedText>{activity.properties.old[attrName]}</HighlightedText>
                                    <span className="mx-1"> to </span>
                                    <HighlightedText>{activity.properties.attributes[attrName]}</HighlightedText>
                                </div>
                            }
                        </>
                    }

                    {activity?.subject_name==='task' && activity?.event === 'removed' && attrName==='name' &&
                        <>
                            <div className="mt-4">
                                <HighlightedText>{activity.properties.attributes[attrName]}</HighlightedText>
                                <span className="mx-1"> is deleted. </span>
                            </div>

                        </>
                    }
                    {activity?.subject_name==='task' && activity?.event === 'attachment-removed' && attrName==='name' &&
                        <>
                            <div className="mt-4">
                                <HighlightedText>{activity.properties.attributes[attrName]}</HighlightedText>
                                <span className="mx-1"> is deleted. </span>
                            </div>

                        </>
                    }
                    {activity?.subject_name==='task' && activity?.event === 'attachment-upload' && attrName==='name' &&
                        <>
                            <div className="mt-4">
                                <HighlightedText>{activity.properties.attributes[attrName]}</HighlightedText>
                                <span className="mx-1"> is upload. </span>
                            </div>

                        </>
                    }
                </Fragment>
            )
        })
    )
}

export default ActivityLogs
