import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { DispatchType, RootState } from '../redux/store';

export const useTypedDispatch = () => useDispatch<DispatchType>();
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
