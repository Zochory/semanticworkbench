// Copyright (c) Microsoft. All rights reserved.

import { FirstRunProgressIndicator } from '@fluentui-copilot/react-copilot';
import {
    Button,
    Dialog,
    DialogSurface,
    DialogTrigger,
    Image,
    Link,
    MessageBar,
    MessageBarBody,
    MessageBarTitle,
    makeStyles,
    shorthands,
    tokens,
} from '@fluentui/react-components';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { setCompletedFirstRun } from '../../redux/features/app/appSlice';

const useClasses = makeStyles({
    surface: {
        overflow: 'hidden',
        ...shorthands.padding(0),
        ...shorthands.border('none'),
    },
    page: {
        display: 'flex',
        flexDirection: 'column',
    },
    image: {
        height: '324px',
        width: '600px',
    },
    body: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalM,
        ...shorthands.padding(tokens.spacingVerticalXXL, tokens.spacingHorizontalXXL),
    },
    header: {
        fontSize: tokens.fontSizeBase500,
        fontWeight: tokens.fontWeightSemibold,
    },
    warning: {
        fontWeight: tokens.fontWeightSemibold,
    },
    content: {
        fontWeight: tokens.fontWeightRegular,
    },
    footer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
});

export const ExperimentalNotice: React.FC = () => {
    const classes = useClasses();
    const { completedFirstRun } = useAppSelector((state) => state.app);
    const dispatch = useAppDispatch();
    const [showDialog, setShowDialog] = React.useState(!completedFirstRun?.experimental);
    const [currentIndex, setCurrentIndex] = React.useState(0);

    const NearButton = () => {
        return (
            <Button disabled={currentIndex === 0} onClick={() => setCurrentIndex(currentIndex - 1)}>
                Previous
            </Button>
        );
    };

    const FarButton = () => {
        return currentIndex === contentItems.length - 1 ? (
            <DialogTrigger disableButtonEnhancement>
                <Button appearance="primary">Got it!</Button>
            </DialogTrigger>
        ) : (
            <Button appearance="primary" onClick={() => setCurrentIndex(currentIndex + 1)}>
                Next
            </Button>
        );
    };

    const handleShowDialog = () => {
        setCurrentIndex(0);
        setShowDialog(true);
    };

    const handleDialogClose = () => {
        if (!completedFirstRun?.experimental) {
            dispatch(setCompletedFirstRun({ experimental: true }));
        }
        setShowDialog(false);
    };

    const contentItems: ContentItem[] = [
        {
            image: '/assets/experimental-feature.jpg',
            header: 'EXPERIMENTAL FEATURES',
            text: (
                <>
                    <p>
                        This application is a development tool for exploring ideas and concepts.
                        It is not intended for production use.
                        The application may contain experimental features that are not fully tested and may not be fully functional.
                        Proceed with caution.
                    </p>
                    <p className={classes.warning}>
                        Workbench data is not guaranteed to be secure or private.
                        Do not use real or sensitive data in this application.
                        Do not use this application to collect, store, or process personal data.
                        Any information you enter into this application may be visible to others and may be lost or corrupted.
                    </p>
                </>
            ),
        },
        {
            image: '/assets/workflow-designer-1.jpg',
            header: 'UNDER DEVELOPMENT',
            text: (
                <>
                    <p>
                        This application is under development and <em>will</em> change.
                        Features may be added, removed, or changed at any time.
                        The application may be unavailable or unstable during updates.
                        Some or all local data <em>can be</em> lost or corrupted during some of these updates.
                        Proceed with caution.
                    </p>
                    <p className={classes.warning}>
                        If you need something more stable or want to leverage this work to build your own demos, consider working with a specific commit of the code.
                    </p>
                </>
            ),
        },
    ];

    return (
        <Dialog
            open={showDialog}
            modalType={!completedFirstRun?.experimental ? 'alert' : undefined}
            onOpenChange={(_event, data) => {
                if (!data.open) {
                    handleDialogClose();
                } else {
                    handleShowDialog();
                }
            }}
        >
            <DialogTrigger>
                <MessageBar intent="warning" layout="multiline">
                    <MessageBarBody>
                        <MessageBarTitle>Experimental App reminder.</MessageBarTitle>
                        Use with caution. &nbsp;
                        <Link>[details]</Link>
                    </MessageBarBody>
                </MessageBar>
            </DialogTrigger>
            <DialogSurface className={classes.surface}>
                {/* // TODO: Replace with actual FirstRunExperience component
                // right now it does not show the content on initial load, try again
                // in the future */}
                {/* <FirstRunExperience footer={<FirstRunFooter nearContent={<NearButton />} farContent={<FarButton />} />}>
                    <FirstRunContent
                        image={<Image src="./stories/onenote-01@1x.webp" width={600} height={324} alt="Copilot logo" />}
                        header="Welcome to Copilot"
                        text="Explore new ways to work smarter and faster using the power of AI. Copilot can help you create, catch up, find info buried in files, and more."
                    />
                    <FirstRunContent
                        image={<Image src="./stories/onenote-01@1x.webp" width={600} height={324} alt="Copilot logo" />}
                        header="Welcome to Copilot"
                        text="Explore new ways to work smarter and faster using the power of AI. Copilot can help you create, catch up, find info buried in files, and more."
                    />
                </FirstRunExperience> */}
                <div className={classes.page}>
                    <div className={classes.image}>
                        <Image fit="cover" src={contentItems[currentIndex].image} />
                    </div>
                    <div className={classes.body}>
                        <div className={classes.header}>{contentItems[currentIndex].header}</div>
                        <div className={classes.content}>{contentItems[currentIndex].text}</div>
                        <div className={classes.footer}>
                            <NearButton />
                            <FirstRunProgressIndicator
                                selectedStep={currentIndex}
                                numberOfsteps={contentItems.length}
                            />
                            <FarButton />
                        </div>
                    </div>
                </div>
            </DialogSurface>
        </Dialog>
    );
};

interface ContentItem {
    image: string;
    header: React.ReactNode;
    text: React.ReactNode;
}
