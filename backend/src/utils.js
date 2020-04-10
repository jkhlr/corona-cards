import v8 from 'v8'

function cloneState(state) {
    return v8.deserialize(v8.serialize(state));
}

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }
}

export {cloneState, ValidationError}
