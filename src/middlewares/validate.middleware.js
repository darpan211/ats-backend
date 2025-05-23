import Joi from 'joi';
import { pick } from '../utils/helper.js'; // We'll define this below

export const validate = (schema, allowUnknown = false) => {
    return (req, res, next) => {
        const validSchema = pick(schema, ['params', 'query', 'body']);
        const objectToValidate = pick(req, Object.keys(validSchema));

        const { value, error } = Joi.compile(validSchema)
            .prefs({ errors: { label: 'key' } })
            .validate(objectToValidate, { abortEarly: false, allowUnknown });

        if (error) {
            return res.status(422).json({
                message: 'Validation failed',
                errors: error.details.map(({ message }) => message),
            });
        }

        Object.assign(req, value);
        return next();
    };
};
