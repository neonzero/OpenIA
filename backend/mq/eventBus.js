class EventBus {
  constructor() {
    this.subscribers = new Map();
    this.published = [];
  }

  publish(eventName, payload) {
    const record = { event: eventName, payload, publishedAt: new Date().toISOString() };
    this.published.push(record);
    const subscribers = this.subscribers.get(eventName) || [];
    subscribers.forEach((handler) => {
      try {
        handler(payload);
      } catch (err) {
        // swallow errors in the stubbed bus to keep publishing resilient
      }
    });
    return record;
  }

  subscribe(eventName, handler) {
    const handlers = this.subscribers.get(eventName) || [];
    handlers.push(handler);
    this.subscribers.set(eventName, handlers);
    return () => {
      const current = this.subscribers.get(eventName) || [];
      this.subscribers.set(
        eventName,
        current.filter((fn) => fn !== handler),
      );
    };
  }

  clear() {
    this.subscribers.clear();
    this.published = [];
  }
}

module.exports = EventBus;
