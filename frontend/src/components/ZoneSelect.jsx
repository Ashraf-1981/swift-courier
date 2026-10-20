// one area dropdown + its warning note (used for pickup and drop-off)
function ZoneSelect({ label, zones, value, onChange }) {
    const zone = zones.find((z) => z.id === Number(value));
    return (
        <div className="col-md-6">
            <label className="form-label">{label}</label>
            <select className="form-select" value={value} onChange={(e) => onChange(e.target.value)}>
                <option value="">Choose...</option>
                {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
            {zone && zone.restricted_note && (
                <small className="text-danger">⚠ {zone.restricted_note}</small>
            )}
        </div>
    );
}

export default ZoneSelect;