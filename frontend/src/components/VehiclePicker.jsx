// vehicle cards; the picked one gets a blue border
function VehiclePicker({ types, selectedId, onSelect }) {
    return (
        <div className="row g-3 mb-4">
            {types.map((type) => (
                <div className="col-6 col-md-4" key={type.id}>
                    <div
                        className={`card h-100 ${selectedId === type.id ? 'border-primary border-2' : ''}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => onSelect(type.id)}
                    >
                        <div className="card-body">
                            <h6 className="card-title">{type.name}</h6>
                            <p className="small text-muted mb-1">{type.suitable_for}</p>
                            <p className="small mb-0">From ${type.base_fee} - max {type.max_weight_kg} kg</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default VehiclePicker;