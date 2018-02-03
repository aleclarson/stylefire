import frame from 'framesync';
import { ChangedValues, Config, Props, State, Styler } from './types';

const createStyler = ({ onRead, onRender, aliasMap = {}, useCache = true }: Config) => (props?: Props): Styler => {
  const state: State = {};
  const changedValues: ChangedValues = [];
  let hasChanged: boolean = false;

  const setValue = (unmappedKey: string, value: any) => {
    const key = aliasMap[unmappedKey] || unmappedKey;
    const currentValue = state[key];
    if (value !== null) {
      state[key] = value;
    } else {
      delete state[key];
    }
    if (state[key] !== currentValue) {
      if (changedValues.indexOf(key) === -1) {
        changedValues.push(key);
      }
      if (!hasChanged) {
        hasChanged = true;
        frame.once('render', render, true);
      }
    }
  };

  function render(forceRender = false) {
    if (forceRender || hasChanged) {
      onRender(state, props, changedValues);
      hasChanged = false;
      changedValues.length = 0;
    }

    return this;
  }

  return {
    get(unmappedKey: string) {
      const key = aliasMap[unmappedKey] || unmappedKey;

      return (key)
        ? (useCache && state[key] !== undefined)
          ? state[key]
          : onRead(key, props)
        : state;
    },
    set(values: string | State, value?: any) {
      if (typeof values === 'string') {
        if (value !== undefined) {
          setValue(values, value);
        } else {
          return (v: any) => setValue(values, v);
        }
      } else {
        for (const key in values) {
          if (values.hasOwnProperty(key)) {
            setValue(key, values[key]);
          }
        }
      }

      return this;
    },
    render,
  };
};

export default createStyler;
