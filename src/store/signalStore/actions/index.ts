import { createRemoveSignalAction } from './removeSignal';
import { createAddSignalAction } from './addSignal';
import { createEditSignalAction } from './editSignal';
import { createUpdateSignalStatusAction } from './updateSignalStatus';

export const createActions = (set: Function, get: Function) => ({
  removeSignal: createRemoveSignalAction(set, get),
  addSignal: createAddSignalAction(set, get),
  editSignal: createEditSignalAction(set, get),
  updateSignalStatus: createUpdateSignalStatusAction(set, get)
});