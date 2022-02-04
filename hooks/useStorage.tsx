import useSWR from 'swr';
import localforage from 'localforage'
import { useEffect, useState } from 'react';

export default function useStorage(key: string): { value: any, setter: (v: any) => void } {
    const [value, setValue] = useState<any>(undefined)

	const { data } = useSWR(`storage-${key}`, async () => {
        return await localforage.getItem(key);
    })

    useEffect(() => {
        setValue(data);
    }, [data])

    return {
        value: value,
        setter: async (newValue: any) => {
            setValue(newValue)
            await localforage.setItem(key, newValue)
        },
    }
}