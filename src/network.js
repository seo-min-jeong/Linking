export const network = {
    isOnline: false,
    showOffline: function(elem) {
      network.isOnline = false;
      elem.innerHTML = '<span class="red"> </span>';
    },
    showOnline: function(elem) {
      network.isOnline = true;
      elem.innerHTML = '<span class="green"> </span>';
    },
    statusListener: function(elem) {
      return function(event) {
        if (
          network.isOnline &&
          ((event.type === 'status-changed' && event.value === 'deactivated') ||
            (event.type === 'stream-connection-status-changed' &&
              event.value === 'disconnected') ||
            (event.type === 'document-synced' && event.value === 'sync-failed'))
        ) {
          network.showOffline(elem);
        } else if (
          !network.isOnline &&
          ((event.type === 'status-changed' && event.value === 'activated') ||
            (event.type === 'stream-connection-status-changed' &&
              event.value === 'connected') ||
            (event.type === 'document-synced' && event.value === 'synced') ||
            event.type === 'peers-changed' ||
            event.type === 'documents-changed')
        ) {
          network.showOnline(elem);
        }
      };
    },
  };