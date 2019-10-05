import moment from 'moment';

export const updateObject = (oldObject, newProps) => {
    return {
        ...oldObject,
        ...newProps
    };
};

export const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export const sortingData = (array, field, type) => {
    if (field === 'date') { // SORTING DATE
        array.sort((a, b) => {
            let dateA = a[field];
            let dateB = b[field];
            const dateAFormat = dateA.length > 12 ? 'DD-MM-YYYY - HH:mm' : 'DD-MM-YYYY';
            const dateBFormat = dateB.length > 12 ? 'DD-MM-YYYY - HH:mm' : 'DD-MM-YYYY';
            if (a[field] !== '') dateA = moment(a[field], dateAFormat);
            if (b[field] !== '') dateB = moment(b[field], dateBFormat);
            if (type === 'ASC') return dateA < dateB;
            if (type === 'DESC') return dateA > dateB;
        });
    } else if (field === 'priority') { // SORTING PRIORITY
        array.sort((a, b) => {
            const convertPriority = (priority) => {
                switch (priority) {
                    case "low":
                        return 1;
                    case "medium":
                        return 2;
                    case "high":
                        return 3;
                    default:
                        return 0;
                }
            };

            let A = convertPriority(a[field]);
            let B = convertPriority(b[field]);

            if (type === 'ASC') return A < B;
            if (type === 'DESC') return A > B;
        });
    } else { // DEFAULT SORTING
        if (type === 'ASC') array.sort((a, b) => ('' + a[field]).localeCompare(b[field]));
        if (type === 'DESC') array.sort((a, b) => ('' + b[field]).localeCompare(a[field]));
    }
};

export const sortingByType = (array, sorting, sortingType) => {
    switch (sorting) {
        case "byAZ":
            return sortingData(array, 'name', sortingType);
        case "byDate":
            return sortingData(array, 'date', sortingType);
        case "byCategory":
            return sortingData(array, 'category', sortingType);
        case "byPriority":
            return sortingData(array, 'priority', sortingType);
        default:
            return array;
    }
};

export const convertNumberToDate = (number) => {
    switch (number) {
        case 0:
            return "days";
        case 1:
            return "week";
        case 2:
            return "month";
        case 3:
            return "year";
        default:
            return "days"
    }
};

export const generateDialogObject = (title, description, buttons) => {
    let object = {
        title,
        description,
        buttons: []
    };
    Object.keys(buttons).map(key => {
        object.buttons.push({
            label: key,
            onPress: buttons[key]
        })
    });
    return object;
};

export const generateInputDialogObject = (title, focus, value, onChange, buttons) => {
    let object = {
        title,
        focus,
        value,
        onChange,
        buttons: []
    };
    Object.keys(buttons).map(key => {
        object.buttons.push({
            label: key,
            onPress: buttons[key]
        })
    });
    return object;
};

export const valid = (controls, value, name, translations, callback) => {
    let validStatus = true;

    // Validation system
    if (controls[name].characterRestriction) {
        if (value.length > controls[name].characterRestriction) {
            controls[name].error = `${capitalize(name)} ${translations.tooLong}`;
            validStatus = false;
        }
    }
    if (controls[name].number) {
        if (+value !== parseInt(value, 10)) {
            controls[name].error = `${capitalize(name)} ${translations.number}`;
            validStatus = false;
        } else {
            if (controls[name].positiveNumber) {
                if (+value < 1) {
                    controls[name].error = `${capitalize(name)} ${translations.greaterThanZero}`;
                    validStatus = false;
                }
            }
        }
    }
    if (controls[name].required) {
        if (value.trim() === '') {
            controls[name].error = `${capitalize(name)} ${translations.required}`;
            validStatus = false;
        }
    }

    if (validStatus && controls[name].error) {
        delete controls[name].error;
    }

    callback(controls);
};