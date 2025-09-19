class BaseSchema {
  constructor(validator) {
    this.validator = validator;
    this._isOptional = false;
    this._defaultValue = undefined;
    this._hasDefault = false;
    this._refinements = [];
  }

  optional() {
    const clone = this._clone();
    clone._isOptional = true;
    return clone;
  }

  default(value) {
    const clone = this._clone();
    clone._defaultValue = value;
    clone._hasDefault = true;
    return clone;
  }

  refine(check, message = 'Validation failed') {
    const clone = this._clone();
    clone._refinements.push({ check, message });
    return clone;
  }

  _clone() {
    const clone = new BaseSchema(this.validator);
    clone._isOptional = this._isOptional;
    clone._defaultValue = this._defaultValue;
    clone._hasDefault = this._hasDefault;
    clone._refinements = [...this._refinements];
    return clone;
  }

  parse(value) {
    if (value === undefined || value === null) {
      if (this._hasDefault) {
        return typeof this._defaultValue === 'function'
          ? this._defaultValue()
          : this._defaultValue;
      }
      if (this._isOptional) {
        return undefined;
      }
      throw new Error('Value is required');
    }
    const parsed = this.validator(value);
    for (const refinement of this._refinements) {
      if (!refinement.check(parsed)) {
        throw new Error(refinement.message);
      }
    }
    return parsed;
  }
}

class StringSchema extends BaseSchema {
  constructor() {
    super((value) => {
      if (typeof value !== 'string') {
        throw new Error('Expected string');
      }
      return value;
    });
    this._min = null;
    this._max = null;
    this._uuid = false;
    this._email = false;
  }

  _clone() {
    const clone = new StringSchema();
    clone._isOptional = this._isOptional;
    clone._defaultValue = this._defaultValue;
    clone._hasDefault = this._hasDefault;
    clone._refinements = [...this._refinements];
    clone._min = this._min;
    clone._max = this._max;
    clone._uuid = this._uuid;
    clone._email = this._email;
    return clone;
  }

  min(length, message = `Expected at least ${length} characters`) {
    const clone = this._clone();
    clone._min = { length, message };
    clone.validator = (value) => {
      if (typeof value !== 'string') {
        throw new Error('Expected string');
      }
      if (value.length < length) {
        throw new Error(message);
      }
      if (clone._max && value.length > clone._max.length) {
        throw new Error(clone._max.message);
      }
      if (clone._uuid) {
        validateUuid(value, clone._uuidMessage);
      }
      if (clone._email && !/^\S+@\S+\.\S+$/.test(value)) {
        throw new Error('Invalid email address');
      }
      return value;
    };
    return clone;
  }

  max(length, message = `Expected at most ${length} characters`) {
    const clone = this._clone();
    clone._max = { length, message };
    clone.validator = (value) => {
      if (typeof value !== 'string') {
        throw new Error('Expected string');
      }
      if (clone._min && value.length < clone._min.length) {
        throw new Error(clone._min.message);
      }
      if (value.length > length) {
        throw new Error(message);
      }
      if (clone._uuid) {
        validateUuid(value, clone._uuidMessage);
      }
      if (clone._email && !/^\S+@\S+\.\S+$/.test(value)) {
        throw new Error('Invalid email address');
      }
      return value;
    };
    return clone;
  }

  uuid(message = 'Invalid UUID') {
    const clone = this._clone();
    clone._uuid = true;
    clone._uuidMessage = message;
    clone.validator = (value) => {
      if (typeof value !== 'string') {
        throw new Error('Expected string');
      }
      validateUuid(value, message);
      if (clone._min && value.length < clone._min.length) {
        throw new Error(clone._min.message);
      }
      if (clone._max && value.length > clone._max.length) {
        throw new Error(clone._max.message);
      }
      return value;
    };
    return clone;
  }

  email() {
    const clone = this._clone();
    clone._email = true;
    clone.validator = (value) => {
      if (typeof value !== 'string') {
        throw new Error('Expected string');
      }
      if (!/^\S+@\S+\.\S+$/.test(value)) {
        throw new Error('Invalid email address');
      }
      if (clone._min && value.length < clone._min.length) {
        throw new Error(clone._min.message);
      }
      if (clone._max && value.length > clone._max.length) {
        throw new Error(clone._max.message);
      }
      return value;
    };
    return clone;
  }
}

class NumberSchema extends BaseSchema {
  constructor() {
    super((value) => {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        throw new Error('Expected number');
      }
      return value;
    });
    this._min = null;
    this._max = null;
    this._int = false;
  }

  _clone() {
    const clone = new NumberSchema();
    clone._isOptional = this._isOptional;
    clone._defaultValue = this._defaultValue;
    clone._hasDefault = this._hasDefault;
    clone._refinements = [...this._refinements];
    clone._min = this._min;
    clone._max = this._max;
    clone._int = this._int;
    return clone;
  }

  min(value, message = `Expected number >= ${value}`) {
    const clone = this._clone();
    clone._min = { value, message };
    clone.validator = (input) => {
      if (typeof input !== 'number' || Number.isNaN(input)) {
        throw new Error('Expected number');
      }
      if (clone._int && !Number.isInteger(input)) {
        throw new Error('Expected integer');
      }
      if (input < value) {
        throw new Error(message);
      }
      if (clone._max && input > clone._max.value) {
        throw new Error(clone._max.message);
      }
      return input;
    };
    return clone;
  }

  max(value, message = `Expected number <= ${value}`) {
    const clone = this._clone();
    clone._max = { value, message };
    clone.validator = (input) => {
      if (typeof input !== 'number' || Number.isNaN(input)) {
        throw new Error('Expected number');
      }
      if (clone._int && !Number.isInteger(input)) {
        throw new Error('Expected integer');
      }
      if (clone._min && input < clone._min.value) {
        throw new Error(clone._min.message);
      }
      if (input > value) {
        throw new Error(message);
      }
      return input;
    };
    return clone;
  }

  int(message = 'Expected integer') {
    const clone = this._clone();
    clone._int = true;
    clone.validator = (input) => {
      if (typeof input !== 'number' || Number.isNaN(input) || !Number.isInteger(input)) {
        throw new Error(message);
      }
      if (clone._min && input < clone._min.value) {
        throw new Error(clone._min.message);
      }
      if (clone._max && input > clone._max.value) {
        throw new Error(clone._max.message);
      }
      return input;
    };
    return clone;
  }
}

class BooleanSchema extends BaseSchema {
  constructor() {
    super((value) => {
      if (typeof value !== 'boolean') {
        throw new Error('Expected boolean');
      }
      return value;
    });
  }

  _clone() {
    const clone = new BooleanSchema();
    clone._isOptional = this._isOptional;
    clone._defaultValue = this._defaultValue;
    clone._hasDefault = this._hasDefault;
    clone._refinements = [...this._refinements];
    return clone;
  }
}

class EnumSchema extends BaseSchema {
  constructor(values) {
    super((value) => {
      if (!values.includes(value)) {
        throw new Error(`Expected one of: ${values.join(', ')}`);
      }
      return value;
    });
    this.values = values;
  }

  _clone() {
    const clone = new EnumSchema(this.values);
    clone._isOptional = this._isOptional;
    clone._defaultValue = this._defaultValue;
    clone._hasDefault = this._hasDefault;
    clone._refinements = [...this._refinements];
    return clone;
  }
}

class ArraySchema extends BaseSchema {
  constructor(itemSchema) {
    super((value) => {
      if (!Array.isArray(value)) {
        throw new Error('Expected array');
      }
      return value.map((item) => itemSchema.parse(item));
    });
    this.itemSchema = itemSchema;
  }

  _clone() {
    const clone = new ArraySchema(this.itemSchema);
    clone._isOptional = this._isOptional;
    clone._defaultValue = this._defaultValue;
    clone._hasDefault = this._hasDefault;
    clone._refinements = [...this._refinements];
    return clone;
  }
}

class ObjectSchema extends BaseSchema {
  constructor(shape) {
    super((value) => {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new Error('Expected object');
      }
      const result = {};
      for (const [key, schema] of Object.entries(shape)) {
        result[key] = schema.parse(value[key]);
      }
      return result;
    });
    this.shape = shape;
  }

  _clone() {
    const clone = new ObjectSchema(this.shape);
    clone._isOptional = this._isOptional;
    clone._defaultValue = this._defaultValue;
    clone._hasDefault = this._hasDefault;
    clone._refinements = [...this._refinements];
    return clone;
  }

  extend(extension) {
    return new ObjectSchema({ ...this.shape, ...extension });
  }
}

function validateUuid(value, message) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(value)) {
    throw new Error(message);
  }
}

const z = {
  string: () => new StringSchema(),
  number: () => new NumberSchema(),
  boolean: () => new BooleanSchema(),
  enum: (values) => new EnumSchema(values),
  array: (schema) => new ArraySchema(schema),
  object: (shape) => new ObjectSchema(shape),
};

module.exports = { z, BaseSchema, StringSchema, NumberSchema, BooleanSchema, EnumSchema, ArraySchema, ObjectSchema };
