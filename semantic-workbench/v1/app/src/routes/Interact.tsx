// Copyright (c) Microsoft. All rights reserved.

import { Button, makeStyles, mergeClasses, shorthands, tokens } from '@fluentui/react-components';
import { BookInformation24Regular, PanelLeftExpand24Regular } from '@fluentui/react-icons';
import React from 'react';
import { useParams } from 'react-router-dom';
import { Constants } from '../Constants';
import { AppView } from '../components/App/AppView';
import { Loading } from '../components/App/Loading';
import { ConversationControls } from '../components/Conversations/ConversationControls';
import { ConversationShare } from '../components/Conversations/ConversationShare';
import { InteractHistory } from '../components/Conversations/InteractHistory';
import { InteractInput } from '../components/Conversations/InteractInput';
import { InteractInspectorsList } from '../components/Conversations/InteractInspectorsList';
import { useSiteUtility } from '../libs/useSiteUtility';
import { useAppDispatch, useAppSelector } from '../redux/app/hooks';
import { setChatWidthPercent } from '../redux/features/app/appSlice';
import { useGetConversationParticipantsQuery, useGetConversationQuery } from '../services/workbench';

const useClasses = makeStyles({
    root: {
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gridTemplateRows: '1fr',
        height: '100%',
    },
    main: {
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: '1fr auto',
        height: '100%',
    },
    history: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: tokens.spacingVerticalM,
    },
    controls: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'stretch',
        zIndex: 1000,
    },
    drawer: {
        '& > .fui-DrawerBody': {
            backgroundImage: `linear-gradient(to right, ${tokens.colorNeutralBackground1}, ${tokens.colorBrandBackground2})`,
            backgroundSize: '100%',
        },
    },
    drawerHeader: {
        ...shorthands.borderBottom(tokens.strokeWidthThick, 'solid', tokens.colorNeutralStroke3),
    },
    drawerBody: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalM,
        ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
    },
    drawerButton: {
        position: 'absolute',
        ...shorthands.padding(tokens.spacingVerticalS),
    },
    card: {},
    resizer: {
        ...shorthands.borderLeft(tokens.strokeWidthThin, 'solid', tokens.colorNeutralBackground5),
        width: '8px',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        cursor: 'col-resize',
        resize: 'horizontal',
        ':hover': {
            borderLeftWidth: '4px',
        },
    },
    resizerActive: {
        borderLeftWidth: '4px',
        borderLeftColor: tokens.colorNeutralBackground5Pressed,
    },
    inspectorButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        ...shorthands.padding(tokens.spacingVerticalS),
        zIndex: 1000,
    },
    inspectors: {
        position: 'relative',
        backgroundColor: tokens.colorNeutralBackgroundAlpha,
        height: '100%',
        overflowY: 'auto',
    },
    input: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundImage: `linear-gradient(to right, ${tokens.colorNeutralBackground1}, ${tokens.colorBrandBackground2})`,
        ...shorthands.borderTop(tokens.strokeWidthThick, 'solid', tokens.colorNeutralStroke3),
        ...shorthands.borderBottom(tokens.strokeWidthThick, 'solid', tokens.colorNeutralStroke3),
    },
    historyContent: {
        // do not use flexbox here, it breaks the virtuoso
        width: '100%',
        maxWidth: `${Constants.app.maxContentWidth}px`,
        ...shorthands.padding(0, tokens.spacingHorizontalXXXL),
    },
    historyContentWithInspector: {
        paddingRight: tokens.spacingHorizontalNone,
    },
});

export const Interact: React.FC = () => {
    const { conversationId } = useParams();
    if (!conversationId) {
        throw new Error('Conversation ID is required');
    }

    const classes = useClasses();
    const { chatWidthPercent } = useAppSelector((state) => state.app);
    const dispatch = useAppDispatch();
    const animationFrame = React.useRef<number>(0);
    const resizeHandleRef = React.useRef<HTMLDivElement>(null);
    const {
        data: conversation,
        error: conversationError,
        isLoading: isLoadingConversation,
    } = useGetConversationQuery(conversationId);
    const {
        data: participants,
        error: participantsError,
        isLoading: isLoadingParticipants,
    } = useGetConversationParticipantsQuery(conversationId);

    const [drawerIsOpen, setDrawerIsOpen] = React.useState(false);
    const [inspectorIsOpen, setInspectorIsOpen] = React.useState(false);
    const [checkedParticipantLength, setCheckedParticipantLength] = React.useState(false);
    const [isResizing, setIsResizing] = React.useState(false);
    const siteUtility = useSiteUtility();

    if (conversationError) {
        const errorMessage = JSON.stringify(conversationError);
        throw new Error(`Error loading conversation: ${errorMessage}`);
    }

    if (participantsError) {
        const errorMessage = JSON.stringify(participantsError);
        throw new Error(`Error loading participants: ${errorMessage}`);
    }

    if (!isLoadingConversation && !conversation) {
        const errorMessage = `No conversation loaded for ${conversationId}`;
        throw new Error(errorMessage);
    }

    if (!isLoadingParticipants && !participants) {
        const errorMessage = `No participants loaded for ${conversationId}`;
        throw new Error(errorMessage);
    }

    React.useEffect(() => {
        if (conversation && participants) {
            siteUtility.setDocumentTitle(conversation.title);
            if (participants.length < 2 && !checkedParticipantLength) {
                setCheckedParticipantLength(true);
                setDrawerIsOpen(true);
            }
        }
    }, [checkedParticipantLength, conversation, participants, siteUtility]);

    const startResizing = React.useCallback(() => setIsResizing(true), []);
    const stopResizing = React.useCallback(() => setIsResizing(false), []);

    const resize = React.useCallback(
        (event: { clientX: number }) => {
            animationFrame.current = requestAnimationFrame(() => {
                if (isResizing && resizeHandleRef.current) {
                    const desiredWidth =
                        resizeHandleRef.current.getBoundingClientRect().left +
                        (event.clientX - resizeHandleRef.current.getBoundingClientRect().left);
                    const desiredWidthPercent = (desiredWidth / window.innerWidth) * 100;
                    const minChatWidthPercent = Constants.app.minChatWidthPercent;
                    dispatch(
                        setChatWidthPercent(
                            Math.max(minChatWidthPercent, Math.min(desiredWidthPercent, 100 - minChatWidthPercent)),
                        ),
                    );
                }
            });
        },
        [dispatch, isResizing],
    );

    React.useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);

        return () => {
            cancelAnimationFrame(animationFrame.current);
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [resize, stopResizing]);

    if (isLoadingConversation || isLoadingParticipants || !conversation || !participants) {
        return (
            <AppView title="Interact">
                <Loading />
            </AppView>
        );
    }

    const actions = {
        items: [<ConversationShare key="share" iconOnly conversationId={conversationId} />],
    };

    return (
        <AppView title={conversation.title} actions={actions} fullSizeContent>
            <div
                className={classes.root}
                style={{
                    gridTemplateColumns: inspectorIsOpen
                        ? `min(${chatWidthPercent}%, ${Constants.app.maxContentWidth}px) auto`
                        : '1fr auto',
                }}
            >
                <div className={classes.main}>
                    <div className={classes.history}>
                        <div className={classes.controls}>
                            {!drawerIsOpen && (
                                <div className={classes.drawerButton}>
                                    <Button icon={<PanelLeftExpand24Regular />} onClick={() => setDrawerIsOpen(true)} />
                                </div>
                            )}
                            {drawerIsOpen && (
                                <ConversationControls
                                    conversation={conversation}
                                    participants={participants}
                                    onOpenChange={(open) => setDrawerIsOpen(open)}
                                />
                            )}
                        </div>
                        <div
                            className={
                                inspectorIsOpen
                                    ? mergeClasses(classes.historyContent, classes.historyContentWithInspector)
                                    : classes.historyContent
                            }
                        >
                            <InteractHistory conversation={conversation} participants={participants} />
                        </div>
                    </div>
                    <div className={classes.input}>
                        <InteractInput conversationId={conversationId} />
                    </div>
                    {!inspectorIsOpen && (
                        <div className={classes.inspectorButton}>
                            <Button
                                appearance={inspectorIsOpen ? 'subtle' : 'secondary'}
                                icon={<BookInformation24Regular />}
                                onClick={() => setInspectorIsOpen(!inspectorIsOpen)}
                            />
                        </div>
                    )}
                </div>
                <div className={classes.inspectors} onMouseDown={(event) => event.preventDefault()}>
                    <div
                        className={mergeClasses(classes.resizer, isResizing && classes.resizerActive)}
                        ref={resizeHandleRef}
                        onMouseDown={startResizing}
                    />
                    {inspectorIsOpen && (
                        <InteractInspectorsList
                            conversation={conversation}
                            participants={participants}
                            onOpenChange={(open) => setInspectorIsOpen(open)}
                        />
                    )}
                </div>
            </div>
        </AppView>
    );
};
