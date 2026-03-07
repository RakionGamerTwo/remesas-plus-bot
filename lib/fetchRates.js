import Papa from 'papaparse';


const SHEET_URL = process.env.SHEET_URL;

const formatValueWithComma = (val) => {
    if (val === undefined || val === null || val === "") return "0";
    
    let cleaned = val.toString().replace(/\./g, '').replace(',', '.').trim();
    let num = parseFloat(cleaned);

    if (isNaN(num)) return "0";

    if (Number.isInteger(num)) {
        
        if (num < 10) {
            return num.toFixed(2).replace('.', ',');
        } else {
            return num.toString();
        }
    } 
    
    return num.toString().replace('.', ',');
};
const parseRoute = (label) => {
    const parts = label.split(/\s*-\s*|\s+a\s+|\s+/i);
    return {
        origin: parts[0]?.trim() || label.trim(),
        dest: parts[1]?.trim() || 'unknown'
    };
};

export async function getRates() {
    try {
        const res = await fetch(SHEET_URL);
        const csvText = await res.text();
        const { data: rows } = Papa.parse(csvText, { header: false });
        
        const result = {};

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const firstCell = row[2];

            if (firstCell && typeof firstCell === 'string' && firstCell.includes('-')) {
                const valueRow = rows[i + 1];
                if (!valueRow) continue;

                for (let j = 2; j <= 12; j++) {
                    const label = row[j];
                    const rawValue = valueRow[j];

                    if (label && rawValue) {
                        const { origin, dest } = parseRoute(label);
                        if (!result[origin]) result[origin] = {};
                        
                        result[origin][dest] = formatValueWithComma(rawValue);
                    }
                }
                i++; 
            }
        }
        return result;
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

