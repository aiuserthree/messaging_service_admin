/**
 * 세금계산서 엑셀 양식에 환불 데이터를 채워 다운로드합니다.
 * 템플릿: assets/세금계산서.xlsx (시트 '엑셀예시양식', 1~12행은 안내/예시, 13행부터 데이터)
 */
(function(global) {
    var TAX_TEMPLATE_URL = 'assets/세금계산서.xlsx';
    var TAX_SHEET_NAME = '엑셀예시양식';
    var NUM_COLS = 84;

    function parseRequestDate(d) {
        if (!d) return { y: new Date().getFullYear(), m: ('0' + (new Date().getMonth() + 1)).slice(-2), ymd: '' };
        var s = String(d).replace(/\s/g, '').replace(/-/g, '').replace(/:/g, '');
        var y = s.slice(0, 4);
        var m = s.slice(4, 6);
        if (!m) m = ('0' + (new Date().getMonth() + 1)).slice(-2);
        return { y: y || new Date().getFullYear(), m: m, ymd: (y + m + (s.slice(6, 8) || '01')) };
    }

    function buildDataRow(r) {
        var row = new Array(NUM_COLS);
        for (var i = 0; i < NUM_COLS; i++) row[i] = '';
        var dt = parseRequestDate(r.requestDate);
        row[0] = 'REF' + (r.id || '') + '_' + (dt.ymd || '');
        row[1] = 'EXCEL';
        row[2] = 2;
        row[3] = 1;
        row[4] = 1;
        row[5] = 1;
        row[6] = dt.y;
        row[7] = dt.m;
        row[8] = '00001';
        row[9] = '';
        row[10] = r.companyName || '';
        row[11] = r.accountHolder || '';
        row[35] = dt.ymd || '';
        var amount = typeof r.actualAmount === 'number' ? r.actualAmount : parseInt(String(r.actualAmount).replace(/\D/g, ''), 10) || 0;
        row[36] = amount;
        row[37] = Math.floor(amount / 11);
        row[75] = r.reason || '';
        row[76] = [r.bankName, r.accountNumber].filter(Boolean).join(' ');
        row[77] = r.bankbookFile || '';
        return row;
    }

    function fillTemplateSheet(wsTemplate, dataRow) {
        var ref = wsTemplate['!ref'];
        if (!ref) return null;
        var range = XLSX.utils.decode_range(ref);
        var out = {};
        var r, c, addr, cell;
        for (r = 0; r <= 2; r++) {
            for (c = 0; c <= range.e.c; c++) {
                addr = XLSX.utils.encode_cell({ r: r, c: c });
                cell = wsTemplate[addr];
                if (cell) out[addr] = { t: cell.t, v: cell.v };
            }
        }
        for (c = 0; c < dataRow.length; c++) {
            addr = XLSX.utils.encode_cell({ r: 3, c: c });
            var v = dataRow[c];
            out[addr] = { t: typeof v === 'number' ? 'n' : 's', v: v };
        }
        out['!ref'] = 'A1:' + XLSX.utils.encode_cell({ r: 3, c: Math.max(range.e.c, dataRow.length - 1) });
        return out;
    }

    function downloadTaxInvoiceXlsx(refundRow, filename) {
        if (typeof XLSX === 'undefined') {
            if (typeof showToast === 'function') showToast('엑셀 라이브러리를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.', 'error');
            else alert('엑셀 라이브러리를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
            return;
        }
        fetch(TAX_TEMPLATE_URL)
            .then(function(res) { return res.arrayBuffer(); })
            .then(function(ab) {
                var wb = XLSX.read(ab, { type: 'array' });
                var sheetName = wb.SheetNames[0];
                if (wb.SheetNames.indexOf(TAX_SHEET_NAME) !== -1) sheetName = TAX_SHEET_NAME;
                var ws = wb.Sheets[sheetName];
                var dataRow = buildDataRow(refundRow);
                var newWs = fillTemplateSheet(ws, dataRow);
                if (!newWs) {
                    if (typeof showToast === 'function') showToast('양식을 읽을 수 없습니다.', 'error');
                    return;
                }
                var outWb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(outWb, newWs, '세금계산서');
                XLSX.writeFile(outWb, filename || ('세금계산서_환불_' + (refundRow.companyName || '').replace(/[/\\?*:"]/g, '_') + '.xlsx'));
                if (typeof showToast === 'function') showToast('엑셀 파일이 다운로드되었습니다.', 'success');
            })
            .catch(function(err) {
                if (typeof showToast === 'function') showToast('양식을 불러오지 못했습니다.', 'error');
                else alert('양식을 불러오지 못했습니다.');
            });
    }

    /** 세금계산서 자동발행 신청 내역용: 업체(공급받는자) 데이터로 양식 채워 다운로드 */
    function buildDataRowFromInvoice(inv) {
        var row = new Array(NUM_COLS);
        for (var i = 0; i < NUM_COLS; i++) row[i] = '';
        var ymd = (inv.periodEnd || '').replace(/-/g, '');
        if (ymd.length === 8) {
            row[35] = ymd;
            row[6] = parseInt(ymd.slice(0, 4), 10);
            row[7] = parseInt(ymd.slice(4, 6), 10);
        } else {
            var d = new Date();
            row[6] = d.getFullYear();
            row[7] = d.getMonth() + 1;
            row[35] = (d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2));
        }
        row[0] = 'INV' + (inv.id || '') + '_' + (ymd || '');
        row[1] = 'EXCEL';
        row[2] = 2;
        row[3] = 1;
        row[4] = 1;
        row[5] = 1;
        row[8] = '00001';
        row[9] = '';
        row[10] = inv.companyName || '';
        row[11] = inv.ceoName || '';
        row[12] = inv.address || '';
        row[22] = (inv.businessNo || '').replace(/-/g, '');
        row[23] = inv.companyName || '';
        row[24] = inv.ceoName || '';
        row[25] = inv.address || '';
        row[36] = typeof inv.supplyAmount === 'number' ? inv.supplyAmount : parseInt(String(inv.supplyAmount).replace(/\D/g, ''), 10) || 0;
        row[37] = typeof inv.taxAmount === 'number' ? inv.taxAmount : parseInt(String(inv.taxAmount).replace(/\D/g, ''), 10) || 0;
        row[71] = typeof inv.totalAmount === 'number' ? inv.totalAmount : parseInt(String(inv.totalAmount).replace(/\D/g, ''), 10) || 0;
        return row;
    }

    function downloadTaxInvoiceXlsxFromInvoice(invoice, filename) {
        if (typeof XLSX === 'undefined') {
            if (typeof showToast === 'function') showToast('엑셀 라이브러리를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.', 'error');
            else alert('엑셀 라이브러리를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
            return;
        }
        fetch(TAX_TEMPLATE_URL)
            .then(function(res) { return res.arrayBuffer(); })
            .then(function(ab) {
                var wb = XLSX.read(ab, { type: 'array' });
                var sheetName = wb.SheetNames[0];
                if (wb.SheetNames.indexOf(TAX_SHEET_NAME) !== -1) sheetName = TAX_SHEET_NAME;
                var ws = wb.Sheets[sheetName];
                var dataRow = buildDataRowFromInvoice(invoice);
                var newWs = fillTemplateSheet(ws, dataRow);
                if (!newWs) {
                    if (typeof showToast === 'function') showToast('양식을 읽을 수 없습니다.', 'error');
                    return;
                }
                var outWb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(outWb, newWs, '세금계산서');
                XLSX.writeFile(outWb, filename || ('세금계산서_' + (invoice.companyName || '').replace(/[/\\?*:"]/g, '_') + '.xlsx'));
                if (typeof showToast === 'function') showToast('엑셀 파일이 다운로드되었습니다.', 'success');
            })
            .catch(function(err) {
                if (typeof showToast === 'function') showToast('양식을 불러오지 못했습니다.', 'error');
                else alert('양식을 불러오지 못했습니다.');
            });
    }

    global.downloadTaxInvoiceXlsx = downloadTaxInvoiceXlsx;
    global.downloadTaxInvoiceXlsxFromInvoice = downloadTaxInvoiceXlsxFromInvoice;
})(typeof window !== 'undefined' ? window : this);
