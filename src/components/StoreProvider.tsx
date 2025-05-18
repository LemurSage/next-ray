import { AppStore, makeStore } from '@/lib/redux/store';
import { useRef } from 'react';
import { Provider } from 'react-redux';

interface StoreProviderProps {
  children: React.ReactNode;
}

export default function StoreProvider({ children }: StoreProviderProps) {
  const ref = useRef<AppStore>();
  if (!ref.current) {
    ref.current = makeStore();
  }

  return <Provider store={ref.current}>{children}</Provider>;
}
