export const PanStateHandlers = {
  setInteractionClasses: (panEnabled: boolean, isPanning?: boolean) => {
    const classes: string[] = [];

    if (panEnabled) {
      classes.push("cursor-grab");
    }

    if (isPanning) {
      classes.push("cursor-grabbing");
    }

    return classes.join(" ");
  },
};
