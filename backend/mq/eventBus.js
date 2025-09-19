const { EventEmitter } = require('events');

class EventBus {
  constructor() {
    this.emitter = new EventEmitter();
  }

  publish(event, payload) {
    // Simulate asynchronous behaviour as Kafka/RabbitMQ would do.
    setImmediate(() => {
      this.emitter.emit(event, payload);
    });
  }

  subscribe(event, handler) {
    this.emitter.on(event, handler);
    return () => this.emitter.off(event, handler);
  }
}

module.exports = new EventBus();
