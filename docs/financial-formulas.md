# Financial formulas

All money values are whole Kenyan shillings. Core arithmetic uses integer and `BigInt` helpers so currency values are never represented as fractional floating-point amounts.

## Budget and quantity

- Budget-driven quantity: `floor(category budget / average buying cost)`
- Quantity-driven budget: `planned quantity × average buying cost`
- Unused category budget: `category budget - direct category stock cost`

## Costs

- Direct stock cost: amount paid for clothing.
- Acquisition cost: sourcing and preparation expenses marked for inventory allocation.
- Landed cost: `direct stock cost + allocated acquisition costs`
- Default allocated acquisition cost: equal per planned item.
- Operating expense: an expense not allocated into inventory landed cost.

## Pricing

- Markup price: `landed cost × (1 + markup percentage)`
- Margin price: `landed cost / (1 - margin percentage)`
- Markup is profit divided by cost.
- Margin is profit divided by selling price.

Rounding options are nearest KES 10, 50 or 100, or the next price ending in 49 or 99.

## Stock outcomes

- Damaged items: `planned quantity × damaged percentage`
- Expected sold items: the lower of category availability after damage/unsold assumptions and the scenario sell-through ceiling.
- Unsold items: `planned quantity - damaged items - expected sold items`

## Revenue

Each category uses its online, market and clearance mix. Those percentages must total 100%.

- Channel revenue before discount: `expected sold items × channel mix × channel price`
- Expected channel revenue: `channel revenue before discount × (1 - discount rate)`
- Expected realised revenue: sum of online, market and clearance revenue.

## Profit

- Gross profit: `expected realised revenue - landed cost of stock sold`
- Net profit: `gross profit - operating expenses - seller commission - payment charges - damaged stock loss`
- Gross margin: `gross profit / expected realised revenue`
- Net margin: `net profit / expected realised revenue`
- Return on invested capital: `net profit / planned cash outlay`
- Profit per item sold: `net profit / expected sold items`

Unsold inventory remains an asset in this planning model; damaged inventory is treated as a projected loss.

## Break-even and recovery

- Break-even revenue: total planned cash outlay.
- Break-even item count: `ceil(planned cash outlay / expected net revenue per item)`
- Break-even sell-through: `break-even item count / non-damaged planned items`
- Capital recovery point: `planned cash outlay / expected realised revenue`

Cash-recovery stages show expected cash after 10%, 25%, 50%, 75%, 90% and 100% of the modelled sales result.

All outputs are estimates driven by assumptions and are not guarantees.
