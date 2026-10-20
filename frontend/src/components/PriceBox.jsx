// price breakdown from GET /api/fee
function PriceBox({ quote, quoteError }) {
    return (
        <div className="card mb-4">
            <div className="card-body">
                {!quote && !quoteError && (
                    <p className="text-muted mb-0">Fill in vehicle, areas and parcel size to see the price.</p>
                )}

                {quoteError && <div className="alert alert-danger mb-0">{quoteError}</div>}

                {quote && (
                    <>
                        {quote.vehicle.upgraded && (
                            <div className="alert alert-warning">
                                Your parcel doesn't fit the vehicle you chose, so it's moved to{' '}
                                <strong>{quote.vehicle.suggested}</strong>.
                            </div>
                        )}
                        <table className="table table-sm mb-0">
                            <tbody>
                                <tr><td>Base fee ({quote.vehicle.suggested})</td><td className="text-end">${quote.fee.base_fee.toFixed(2)}</td></tr>
                                <tr><td>Distance ({quote.fee.distance_km} km)</td><td className="text-end">${quote.fee.distance_fee.toFixed(2)}</td></tr>
                                <tr><td>Extra stops</td><td className="text-end">${quote.fee.stops_fee.toFixed(2)}</td></tr>
                                <tr><td>Surcharges</td><td className="text-end">${quote.fee.surcharge_total.toFixed(2)}</td></tr>
                                {quote.fee.collect_back_fee > 0 && (
                                    <tr className="text-muted">
                                        <td>Collect-back (charged only after collection)</td>
                                        <td className="text-end">${quote.fee.collect_back_fee.toFixed(2)}</td>
                                    </tr>
                                )}
                                <tr className="fw-bold"><td>Total</td><td className="text-end">${quote.fee.total_fee.toFixed(2)}</td></tr>
                            </tbody>
                        </table>
                    </>
                )}
            </div>
        </div>
    );
}

export default PriceBox;