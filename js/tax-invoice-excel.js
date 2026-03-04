/**
 * 세금계산서 엑셀 양식에 데이터를 채워 다운로드합니다.
 * 템플릿: assets/세금계산서.xlsx (시트 '엑셀예시양식', 4행이 데이터 행)
 */
(function(global) {
    var TAX_TEMPLATE_URL = 'assets/세금계산서.xlsx';
    var TAX_SHEET_NAME = '엑셀예시양식';
    var NUM_COLS = 84;
    var DATA_ROW_INDEX = 4; // spec 양식에서 데이터가 들어가는 행(0-based)

    /** file:// 시 CORS 없이 사용하려면 TAX_INVOICE_TEMPLATE_BASE64 사용 (tax-invoice-template.js 로드) */
    function getTemplateArrayBuffer() {
        if (typeof TAX_INVOICE_TEMPLATE_BASE64 === 'string' && TAX_INVOICE_TEMPLATE_BASE64.length > 0) {
            var binary = atob(TAX_INVOICE_TEMPLATE_BASE64);
            var ab = new ArrayBuffer(binary.length);
            var view = new Uint8Array(ab);
            for (var i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);
            return Promise.resolve(ab);
        }
        return fetch(TAX_TEMPLATE_URL).then(function(res) { return res.arrayBuffer(); });
    }

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
        // 템플릿 전체 복사(0~11행 유지)
        for (r = 0; r <= range.e.r; r++) {
            for (c = 0; c <= range.e.c; c++) {
                addr = XLSX.utils.encode_cell({ r: r, c: c });
                cell = wsTemplate[addr];
                if (cell) out[addr] = { t: cell.t, v: cell.v };
            }
        }
        // 데이터 행(4행) 덮어쓰기
        for (c = 0; c < dataRow.length; c++) {
            addr = XLSX.utils.encode_cell({ r: DATA_ROW_INDEX, c: c });
            var v = dataRow[c];
            out[addr] = { t: typeof v === 'number' ? 'n' : 's', v: v };
        }
        out['!ref'] = 'A1:' + XLSX.utils.encode_cell({ r: range.e.r, c: Math.max(range.e.c, dataRow.length - 1) });
        return out;
    }

    function downloadTaxInvoiceXlsx(refundRow, filename) {
        if (typeof XLSX === 'undefined') {
            if (typeof showToast === 'function') showToast('엑셀 라이브러리를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.', 'error');
            else alert('엑셀 라이브러리를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
            return;
        }
        getTemplateArrayBuffer()
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

    /** 세금계산서 자동발행 신청 내역용: 업체(공급받는자) 데이터로 양식 채워 다운로드 (spec 양식 기준) */
    function buildDataRowFromInvoice(inv) {
        var row = new Array(NUM_COLS);
        for (var i = 0; i < NUM_COLS; i++) row[i] = '';
        var ymd = (inv.periodEnd || '').replace(/-/g, '');
        if (ymd.length < 8) {
            var d = new Date();
            ymd = d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2);
        }
        var y = ymd.slice(0, 4);
        var m = ymd.slice(4, 6);
        row[0] = 'INV' + (inv.id || '') + '_' + ymd;
        row[1] = 'EXCEL';
        row[2] = 2;
        row[3] = 1;
        row[4] = 1;
        row[5] = 1;
        row[6] = parseInt(y, 10);
        row[7] = m;
        row[8] = '00001';
        row[9] = '';
        row[10] = inv.companyName || '';
        row[11] = inv.ceoName || '';
        row[12] = (inv.address || '').split(/\s/)[0] || inv.address || '';
        row[13] = (inv.address || '').replace(row[12], '').trim() || '';
        row[22] = (inv.businessNo || '').replace(/-/g, '');
        row[23] = inv.companyName || '';
        row[24] = inv.ceoName || '';
        row[25] = (inv.address || '').split(/\s/)[0] || inv.address || '';
        row[26] = (inv.address || '').replace(row[25], '').trim() || '';
        row[35] = ymd;
        var supplyAmount = typeof inv.supplyAmount === 'number' ? inv.supplyAmount : parseInt(String(inv.supplyAmount).replace(/\D/g, ''), 10) || 0;
        var taxAmount = typeof inv.taxAmount === 'number' ? inv.taxAmount : parseInt(String(inv.taxAmount).replace(/\D/g, ''), 10) || 0;
        var totalAmount = typeof inv.totalAmount === 'number' ? inv.totalAmount : parseInt(String(inv.totalAmount).replace(/\D/g, ''), 10) || 0;
        row[36] = supplyAmount;
        row[37] = taxAmount;
        row[70] = supplyAmount;
        row[71] = taxAmount;
        row[74] = totalAmount;
        return row;
    }

    function downloadTaxInvoiceXlsxFromInvoice(invoice, filename) {
        if (typeof XLSX === 'undefined') {
            if (typeof showToast === 'function') showToast('엑셀 라이브러리를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.', 'error');
            else alert('엑셀 라이브러리를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
            return;
        }
        getTemplateArrayBuffer()
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
