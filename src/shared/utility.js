export const updateObject = (oldObject, newProps) => {
    return {
        ...oldObject,
        ...newProps
    };
};

export const validationSystem = (rules, value) => {
    let isValid = true;

    // Regex
    const password = /(?=.*[\W])(?=.*[\d])(?=.*[\w])/;
    const email = /(?=.*[~`!#$%^&*()_\-+={}[\]:;"'|<>?,/])/;
    const number = /^\d+$/;

    if (!rules) {
        return true;
    }

    if(rules.required && isValid) {
        isValid = value.trim() !== "";
    }

    if(rules.minLength && isValid) {
        isValid = value.length >= rules.minLength;
    }

    if(rules.maxLength && isValid) {
        isValid = value.length <= rules.maxLength;
    }

    if(rules.password && isValid) {
        isValid = password.test(value);
    }

    if(rules.email && isValid) {
        isValid = !email.test(value);
    }

    if (rules.number && isValid) {
        isValid = number.test(value);
    }

    return isValid;
};