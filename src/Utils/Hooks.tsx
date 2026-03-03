import {useEffect, type DependencyList} from "react"

export function useKeyListener(callback: (e: KeyboardEvent) => void, deps?: DependencyList) {
    useEffect(() => {
    
            document.addEventListener("keydown", callback)
    
            return () => {
                document.removeEventListener("keydown", callback);
            }
            
        }, deps);
}