const { JSDOM } = require("jsdom");

describe("Detail Tiket", () => {
  let dom;
  let document;

  beforeEach(() => {
    // Simulasi DOM dari HTML yang diberikan
    dom = new JSDOM(`<!DOCTYPE html>
      <html>
        <body>
          <div class="container mt-5">
            <h1 class="text-center mb-4">Detail Tiket</h1>
            <div class="row" id="ticketContainer">
              <!-- Kartu tiket akan di-generate di sini -->
            </div>
          </div>
        </body>
      </html>
    `);
    document = dom.window.document;

    // Mock fungsi fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Simulasi fungsi untuk memuat data tiket
  async function loadTickets(document) {
    const response = await fetch("/api/tickets");
    const tickets = await response.json();

    const ticketContainer = document.getElementById("ticketContainer");
    ticketContainer.innerHTML = ""; // Clear container

    if (tickets.length === 0) {
      const noTicketsMessage = document.createElement("p");
      noTicketsMessage.textContent = "Belum ada tiket yang disimpan.";
      ticketContainer.appendChild(noTicketsMessage);
    } else {
      tickets.forEach((ticket) => {
        const ticketCard = document.createElement("div");
        ticketCard.className = "ticket-card";

        ticketCard.innerHTML = `
          <div class="ticket-header">${ticket.title}</div>
          <div class="ticket-price">Kode: ${ticket.kode_bk}</div>
          <button class="btn-toggle">Lihat Detail</button>
          <div class="ticket-details" style="display: none;">
            <p>Harga: ${ticket.total_harga}</p>
            <p>Tanggal: ${ticket.date}</p>
            <p>Waktu: ${ticket.time}</p>
            <p>No Kursi: ${ticket.no_kursi}</p>
          </div>
        `;

        ticketCard.querySelector(".btn-toggle").addEventListener("click", (e) => {
          const details = ticketCard.querySelector(".ticket-details");
          details.style.display = details.style.display === "none" ? "block" : "none";
        });

        ticketContainer.appendChild(ticketCard);
      });
    }
  }

  test("Menampilkan pesan jika tidak ada tiket", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await loadTickets(document);

    const ticketContainer = document.getElementById("ticketContainer");
    const noTicketsMessage = ticketContainer.querySelector("p");

    expect(noTicketsMessage).not.toBeNull();
    expect(noTicketsMessage.textContent).toBe("Belum ada tiket yang disimpan.");
  });

  test("Menampilkan tiket dengan detail yang benar", async () => {
    const mockTickets = [
      {
        title: "Galaksi",
        kode_bk: "CODE7KZMUV",
        total_harga: 40000,
        date: "2025-01-08",
        time: "17:30",
        no_kursi: "A8",
      },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTickets,
    });

    await loadTickets(document);

    const ticketContainer = document.getElementById("ticketContainer");
    const cardHeader = ticketContainer.querySelector(".ticket-header");
    const ticketPrice = ticketContainer.querySelector(".ticket-price");

    expect(cardHeader).not.toBeNull();
    expect(cardHeader.textContent).toBe(mockTickets[0].title);
    expect(ticketPrice.textContent).toContain(mockTickets[0].kode_bk);
  });

  test("Perilaku tombol 'Lihat Detail'", async () => {
    const mockTickets = [
      {
        title: "Galaksi",
        kode_bk: "CODE7KZMUV",
        total_harga: 40000,
        date: "2025-01-08",
        time: "17:30",
        no_kursi: "A8",
      },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTickets,
    });

    await loadTickets(document);

    const toggleButton = document.querySelector(".btn-toggle");
    const ticketDetails = document.querySelector(".ticket-details");

    // Awalnya detail tersembunyi
    expect(ticketDetails.style.display).toBe("none");

    // Klik tombol untuk menampilkan detail
    toggleButton.click();
    expect(ticketDetails.style.display).toBe("block");

    // Klik lagi untuk menyembunyikan detail
    toggleButton.click();
    expect(ticketDetails.style.display).toBe("none");
  });
});
