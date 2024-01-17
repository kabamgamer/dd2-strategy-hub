import { ref } from 'vue'
import { defineStore } from 'pinia'

interface Notification {
    id: string,
    type: 'alert'|'notification',
    color: 'primary'|'secondary'|'success'|'danger'|'warning'|'info'|'light'|'dark',
    message: string,
    location?: string,
    dismissible?: boolean,
    duration?: number,
    timeout?: number,
}

export const useNotificationStore = defineStore('notificationStore', () => {
    const notifications = ref<Notification[]>([])

    function addNotification(notification: Notification): void {
        notifications.value.push(notification)

        if (notification.duration) {
            notification.timeout = window.setTimeout(() => {
                removeNotification(notification)
            }, notification.duration)
        }
    }

    function notificationsFromErrors(errors: {[field: string]: string}, location?: string, dismissible: boolean = true): void {
        for (const field in errors) {
            addNotification({
                id: 'error-' + field,
                type: 'alert',
                color: 'danger',
                message: errors[field],
                dismissible,
                location,
                duration: 5000,
            })
        }
    }

    function removeNotification(notificationToRemove: Notification): void {
        notifications.value = notifications.value.filter((notification: Notification) => notification.id !== notificationToRemove.id)

        if (notificationToRemove.timeout) {
            clearTimeout(notificationToRemove.timeout)
        }
    }

    return { notifications, addNotification, notificationsFromErrors, removeNotification }
})
