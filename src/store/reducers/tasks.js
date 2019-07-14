import * as actionTypes from '../actions/actionTypes';
import {updateObject} from '../../shared/utility';

const initState = {
    tasks: false,
    finished: false
};

const initToDo = (state, action) => {
    return updateObject(state,{
        tasks: action.tasks,
        finished: action.finished,
    });
};

const initTasks = (state, action) => {
    return updateObject(state,{
        tasks: action.tasks,
    });
};

const initFinished = (state, action) => {
    return updateObject(state,{
        finished: action.tasks,
    });
};

const reducer = (state = initState, action) => {
    switch (action.type) {
        case actionTypes.INIT_TODO: return initToDo(state, action);
        case actionTypes.INIT_TASKS: return initTasks(state, action);
        case actionTypes.INIT_FINISHED: return initFinished(state, action);
        default: return state;
    }
};

export default reducer;