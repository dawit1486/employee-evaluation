

async function test() {
    console.log('Testing Unfiltered API...');
    try {
        const res1 = await fetch('http://localhost:3001/api/evaluations');
        const data1 = await res1.json();
        console.log(`Unfiltered count: ${Array.isArray(data1) ? data1.length : 'Error'}`);
    } catch (e) { console.error(e.message); }

    console.log('Testing Filtered API (evaluatorId=supervisor)...');
    try {
        const res2 = await fetch('http://localhost:3001/api/evaluations?evaluatorId=supervisor');
        const data2 = await res2.json();
        console.log(`Filtered count: ${Array.isArray(data2) ? data2.length : 'Error'}`);
        if (Array.isArray(data2)) {
            console.log('Ids:', data2.map(e => e.id));
        }
    } catch (e) { console.error(e.message); }
}

test();
