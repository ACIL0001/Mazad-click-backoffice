import { replace } from 'lodash';
import numeral from 'numeral';

// ----------------------------------------------------------------------

export function fCurrency(number) {
    number = number.toFixed(2).toString();
    for (let i = number.indexOf('.') - 3; i > -1; i -= 3) {
        number = number.slice(0, i) + " " + number.slice(i);
    }
    return `${number} DA`;
}

export function fPercent(number) {
    return numeral(number / 100).format('0.0%');
}

export function fNumber(number) {
    return numeral(number).format();
}

export function fShortenNumber(number) {
    if (typeof (number) == "string") return number;
    return replace(numeral(number).format('0.00a'), '.00', '');
}

export function fData(number) {
    return numeral(number).format('0.0 b');
}
