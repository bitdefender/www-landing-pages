export class UpdateByDeltaEvent extends CustomEvent {
    static { this.eventName = "store-update-delta"; }
    constructor(detail) {
        super(UpdateByDeltaEvent.eventName, {
            detail,
            bubbles: true,
            composed: true,
            cancelable: true
        });
    }
}
export class ActionEvent extends CustomEvent {
    static { this.eventName = "store-set-action"; }
    constructor(detail) {
        super(ActionEvent.eventName, {
            detail,
            bubbles: true,
            composed: true,
            cancelable: true
        });
    }
}
export class CollectActionEvent extends CustomEvent {
    static { this.eventName = "store-collect-action"; }
    constructor(detail) {
        super(CollectActionEvent.eventName, {
            detail,
            bubbles: true,
            composed: true,
            cancelable: true
        });
    }
}
export class CollectUpdateByDeltaEvent extends CustomEvent {
    static { this.eventName = "store-collect-update-by-delta"; }
    constructor(detail) {
        super(CollectUpdateByDeltaEvent.eventName, {
            detail,
            bubbles: true,
            composed: true,
            cancelable: true
        });
    }
}
export class CollectOptionEvent extends CustomEvent {
    static { this.eventName = "store-collect-option"; }
    constructor(detail) {
        super(CollectOptionEvent.eventName, {
            detail,
            bubbles: true,
            composed: true,
            cancelable: true
        });
    }
}
export class CollectChildEvent extends CustomEvent {
    static { this.eventName = "store-collect-child"; }
    constructor(detail) {
        super(CollectChildEvent.eventName, {
            detail,
            bubbles: true,
            composed: true,
            cancelable: true
        });
    }
}
export class CollectChildRemovedEvent extends CustomEvent {
    static { this.eventName = "store-collect-child-removed"; }
    constructor(detail) {
        super(CollectChildRemovedEvent.eventName, {
            detail,
            bubbles: true,
            composed: true,
            cancelable: true
        });
    }
}
//# sourceMappingURL=events.js.map