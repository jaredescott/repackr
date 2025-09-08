
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Typography,
  Box,
  Button,
  styled,
  Checkbox,
  ButtonGroup,
  Tooltip
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { ItemTotals } from '../types';

interface TotalsTableProps {
  totals: ItemTotals;
  packedItems: Record<string, boolean>;
  onTogglePacked: (itemName: string) => void;
  onToggleAllPacked: (itemNames: string[], setChecked: boolean) => void;
}

// Create a styled component for print-only header
const PrintHeader = styled(Typography)`
  display: none;
  @media print {
    display: block;
    text-align: center;
    margin-bottom: 20px;
    font-size: 24px;
    color: #000;
  }
`;

// Create a styled component for the print button
const PrintButton = styled(Button)`
  @media print {
    display: none;
  }
`;

const TotalsTable = ({ totals, packedItems, onTogglePacked, onToggleAllPacked }: TotalsTableProps) => {
  // Function to toggle all items using the batch update function
  const handleToggleAll = (setChecked: boolean) => {
    // Get all item names from the totals
    const itemNames = Object.keys(totals);
    
    // Use the batch update function instead of toggling individually
    onToggleAllPacked(itemNames, setChecked);
  };
  
  // Check if all items are checked
  const allChecked = Object.keys(totals).length > 0 && 
    Object.keys(totals).every(itemName => packedItems[itemName]);
  
  // Check if no items are checked
  const noneChecked = Object.keys(totals).length > 0 && 
    Object.keys(totals).every(itemName => !packedItems[itemName]);

  const handlePrint = () => {
    // Create a new window with just the totals table
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print the totals table');
      return;
    }

    // Generate table HTML
    const tableHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>RePackr - Packing List Totals</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
          }
          h1 {
            color: #2E7D32;
            text-align: center;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th, td {
            padding: 12px 15px;
            border: 1px solid #ddd;
            text-align: left;
          }
          th {
            background-color: #f8f8f8;
            font-weight: bold;
          }
          .centered {
            text-align: center;
          }
          .reusable {
            color: #1976d2;
            font-style: italic;
          }
          .checkbox-cell {
            width: 40px;
            text-align: center;
          }
          .checkbox {
            width: 20px;
            height: 20px;
            cursor: pointer;
          }
          .strikethrough {
            text-decoration: line-through;
            color: #888;
          }
          .check-all-controls {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-bottom: 15px;
          }
          .check-button {
            padding: 6px 12px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          }
          .uncheck-button {
            padding: 6px 12px;
            background-color: #f5f5f5;
            color: #333;
            border: 1px solid #ccc;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          }
          @media print {
            button.no-print {
              display: none;
            }
            .check-all-controls {
              display: none;
            }
            .checkbox {
              -webkit-appearance: none;
              border: 1px solid #000;
              width: 20px;
              height: 20px;
            }
            .checkbox:checked {
              position: relative;
            }
            .checkbox:checked:after {
              content: '✓';
              position: absolute;
              top: -3px;
              left: 3px;
              font-size: 16px;
            }
          }
        </style>
        <script>
          function togglePacked(checkboxId, rowId) {
            const checkbox = document.getElementById(checkboxId);
            const row = document.getElementById(rowId);
            
            if (checkbox.checked) {
              row.classList.add('strikethrough');
            } else {
              row.classList.remove('strikethrough');
            }
          }
          
          function toggleAll(setChecked) {
            const checkboxes = document.querySelectorAll('.checkbox');
            const rows = document.querySelectorAll('tbody tr');
            
            checkboxes.forEach((checkbox, index) => {
              checkbox.checked = setChecked;
              if (setChecked) {
                rows[index].classList.add('strikethrough');
              } else {
                rows[index].classList.remove('strikethrough');
              }
            });
          }
        </script>
      </head>
      <body>
        <h1>RePackr - Packing List Totals</h1>
        
        <div class="check-all-controls">
          <button class="check-button no-print" onclick="toggleAll(true)">Mark All as Packed</button>
          <button class="uncheck-button no-print" onclick="toggleAll(false)">Mark All as Unpacked</button>
        </div>
        
        <table>
          <thead>
            <tr>
              <th class="checkbox-cell">✓</th>
              <th>Item</th>
              <th>Category</th>
              <th class="centered">Days Used</th>
              <th class="centered">Total Unit Quantity</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(totals)
              .sort(([aName], [bName]) => aName.localeCompare(bName))
              .map(([itemName, details], index) => {
                const checkboxId = `item-checkbox-${index}`;
                const rowId = `item-row-${index}`;
                const isChecked = packedItems[itemName] ? 'checked' : '';
                const rowClass = packedItems[itemName] ? 'strikethrough' : '';
                
                return `
                  <tr id="${rowId}" class="${rowClass}">
                    <td class="checkbox-cell">
                      <input 
                        type="checkbox" 
                        id="${checkboxId}" 
                        class="checkbox" 
                        ${isChecked}
                        onclick="togglePacked('${checkboxId}', '${rowId}')"
                      >
                    </td>
                    <td>${itemName}</td>
                    <td>${details.category}</td>
                    <td class="centered">${details.daysUsed}</td>
                    <td class="centered">${details.total}</td>
                    <td>${details.isReusable ? '<span class="reusable">(Reusable item)</span>' : ''}</td>
                  </tr>
                `;
              }).join('')}
          </tbody>
        </table>
        <div style="text-align: center; margin-top: 20px;">
          <button class="no-print" onclick="window.print()">Print This Table</button>
          <button class="no-print" onclick="window.close()">Close</button>
        </div>
        <div style="text-align: center; padding-top: 10px; font-style: italic; color: #666;">
          Check off items as you pack them. Checked items will appear with strikethrough.
        </div>
      </body>
      </html>
    `;

    // Write to the new window and prepare for printing
    printWindow.document.open();
    printWindow.document.write(tableHtml);
    printWindow.document.close();
    
    // Print after content is loaded
    printWindow.onload = function() {
      printWindow.focus();
    };
  };

  return (
    <Paper sx={{ 
      p: 2,
      '@media print': {
        boxShadow: 'none',
        padding: 0
      }
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Packing Totals</Typography>
        <Box display="flex" gap={2}>
          <ButtonGroup variant="outlined" size="small">
            <Tooltip title="Mark all items as packed">
              <span>
                <Button 
                  onClick={() => handleToggleAll(true)}
                  startIcon={<CheckCircleOutlineIcon />}
                  disabled={allChecked || Object.keys(totals).length === 0}
                  color="primary"
                >
                  Mark All as Packed
                </Button>
              </span>
            </Tooltip>
            <Tooltip title="Mark all items as unpacked">
              <span>
                <Button 
                  onClick={() => handleToggleAll(false)}
                  startIcon={<RadioButtonUncheckedIcon />}
                  disabled={noneChecked || Object.keys(totals).length === 0}
                  color="primary"
                >
                  Mark All as Unpacked
                </Button>
              </span>
            </Tooltip>
          </ButtonGroup>
          <PrintButton
            variant="outlined"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Print Totals
          </PrintButton>
        </Box>
      </Box>

      <PrintHeader>
        RePackr - Packing List Totals
      </PrintHeader>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" align="center">
                <Typography variant="subtitle2">Packed</Typography>
              </TableCell>
              <TableCell>Item</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="center">Days Used</TableCell>
              <TableCell align="center">Total Unit Quantity</TableCell>
              <TableCell>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(totals)
              .sort(([aName], [bName]) => aName.localeCompare(bName))
              .map(([itemName, details]) => (
                <TableRow 
                  key={itemName}
                  sx={{
                    ...(packedItems[itemName] && {
                      textDecoration: 'line-through',
                      color: 'text.disabled'
                    })
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={!!packedItems[itemName]}
                      onChange={() => onTogglePacked(itemName)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell component="th" scope="row">{itemName}</TableCell>
                  <TableCell>{details.category}</TableCell>
                  <TableCell align="center">{details.daysUsed}</TableCell>
                  <TableCell align="center">{details.total}</TableCell>
                  <TableCell>
                    {details.isReusable ? '(Reusable item)' : ''}
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default TotalsTable; 