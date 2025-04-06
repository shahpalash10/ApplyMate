import { useState, useEffect } from 'react';

interface ToastProps {
  title: string;
  description?: string;
  status?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  isClosable?: boolean;
}

// Create a global toast array to store active toasts
let toasts: ToastProps[] = [];
let setToastsState: React.Dispatch<React.SetStateAction<ToastProps[]>> | null = null;

// Function to add a toast notification
export const toast = (props: ToastProps) => {
  // Use setTimeout to move the state update outside of the render cycle
  setTimeout(() => {
    if (setToastsState) {
      const newToast = {
        title: props.title,
        description: props.description || '',
        status: props.status || 'info',
        duration: props.duration || 3000,
        isClosable: props.isClosable !== undefined ? props.isClosable : true,
      };
      
      toasts = [...toasts, newToast];
      setToastsState([...toasts]);
  
      // Auto remove toast after duration
      if (props.duration !== 0) {
        setTimeout(() => {
          removeToast(toasts.length - 1);
        }, props.duration || 3000);
      }
    }
  }, 0);
};

// Function to remove a toast
const removeToast = (index: number) => {
  if (setToastsState) {
    toasts = toasts.filter((_, i) => i !== index);
    setToastsState([...toasts]);
  }
};

// Toast component
export function ToastContainer() {
  const [stateToasts, setStateToasts] = useState<ToastProps[]>([]);
  
  useEffect(() => {
    setToastsState = setStateToasts;
    return () => {
      setToastsState = null;
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {stateToasts.map((toast, index) => (
        <div 
          key={index}
          className={`px-4 py-3 rounded-md shadow-lg max-w-sm transform transition-all duration-500 ease-in-out flex justify-between items-start
            ${toast.status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 
              toast.status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' : 
              toast.status === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' : 
              'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'}`}
        >
          <div>
            <div className="font-medium">{toast.title}</div>
            {toast.description && (
              <div className="text-sm mt-1">{toast.description}</div>
            )}
          </div>
          {toast.isClosable && (
            <button
              onClick={() => removeToast(index)}
              className="ml-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              aria-label="Close notification"
              title="Close"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4" 
                viewBox="0 0 20 20" 
                fill="currentColor"
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
} 