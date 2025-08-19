import { useState, useEffect } from "react";

/**
 * useLocalStorage hook for persisting state in localStorage.
 * @param key The key to store the value under.
 * @param initialValue The initial value to use if nothing is in storage.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
	// Read from localStorage once on mount
	const readValue = () => {
		if (typeof window === "undefined") return initialValue;
		try {
			const item = window.localStorage.getItem(key);
			return item ? (JSON.parse(item) as T) : initialValue;
		} catch (error) {
			return initialValue;
		}
	};

	const [storedValue, setStoredValue] = useState<T>(readValue);

	// Update localStorage when value changes
	useEffect(() => {
		try {
			window.localStorage.setItem(key, JSON.stringify(storedValue));
		} catch {}
	}, [key, storedValue]);

	// Listen for storage changes in other tabs
	useEffect(() => {
		const handleStorage = (event: StorageEvent) => {
			if (event.key === key && event.newValue) {
				setStoredValue(JSON.parse(event.newValue));
			}
		};
		window.addEventListener("storage", handleStorage);
		return () => window.removeEventListener("storage", handleStorage);
	}, [key]);

	return [storedValue, setStoredValue] as const;
}
