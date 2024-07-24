import { ObjectType, ObservableStore } from '@anotherbush/utils';
import React from 'react';

interface AnotherbushStoreProviderProps<T extends ObjectType> {
  value: T;
  children: React.ReactNode;
}

/**
 * Factory function of creating an observable store.
 */
export const createStore = <T extends ObjectType>() => {
  const StoreContext = React.createContext(new ObservableStore<T>({} as T));
  const useStore = () => React.useContext(StoreContext);
  const Provider = ({ children, value }: AnotherbushStoreProviderProps<T>) => {
    /**
     * Customized configuration here.
     */
    return (
      <StoreContext.Provider
        value={React.useMemo(() => new ObservableStore<T>(value), [])}
      >
        {children}
      </StoreContext.Provider>
    );
  };
  return {
    Provider,
    useStore,
  } as const;
};
