const publicService = require("../services/introduce.service");

// 임원 목록 조회
async function getIntroduceExecutives(req, res) {
    try {
        const executives = await publicService.getExecutives();
        res.json({ success: true, data: executives });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { getIntroduceExecutives };