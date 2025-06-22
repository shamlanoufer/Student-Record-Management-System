const API_BASE_URL = 'http://localhost:3000';
$(document).ready(function() {
    // Initialize UI components
    $('[data-bs-toggle="tooltip"]').tooltip();
    const successToast = new bootstrap.Toast(document.getElementById('successToast'));
    const errorToast = new bootstrap.Toast(document.getElementById('errorToast'));

    // Toast notification functions
    function showSuccess(message) {
        $('#successToastMessage').text(message);
        successToast.show();
    }

    function showError(message) {
        $('#errorToastMessage').text(message);
        errorToast.show();
    }

    // STUDENTS TABLE PAGINATION
    let allStudents = [];
    let studentsPerPage = 10;
    let currentPage = 1;

    function renderStudentsPage(page) {
        currentPage = page;
        const start = (page - 1) * studentsPerPage;
        const end = start + studentsPerPage;
        const studentsToShow = allStudents.slice(start, end);
        const mainTable = $('#studentsTable tbody');
        mainTable.empty();
        if (!studentsToShow.length) {
            mainTable.append('<tr><td colspan="7" class="text-center">No students found.</td></tr>');
        } else {
            studentsToShow.forEach(student => {
                mainTable.append(`
                    <tr>
                        <td>${student.FirstName} ${student.LastName}</td>
                        <td>${student.SID}</td>
                        <td>${student.Email}</td>
                        <td>${student.NearCity}</td>
                        <td>${student.Course.map(c => `<span class="badge bg-primary me-1">${c}</span>`).join('')}</td>
                        <td>${student.Guardian}</td>
                        <td>
                            <button class="btn btn-sm btn-info view-student" data-sid="${student.SID}"><i class="fas fa-eye"></i></button>
                            <button class="btn btn-sm btn-danger delete-student" data-sid="${student.SID}"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `);
            });
        }
        renderPagination();
    }

    function renderPagination() {
        const totalPages = Math.ceil(allStudents.length / studentsPerPage);
        const pagination = $('#studentPagination');
        pagination.empty();
        let html = '';
        html += `<li class="page-item${currentPage === 1 ? ' disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a></li>`;
        for (let i = 1; i <= totalPages; i++) {
            html += `<li class="page-item${currentPage === i ? ' active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
        }
        html += `<li class="page-item${currentPage === totalPages ? ' disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a></li>`;
        pagination.html(html);
    }

    // 1. Load all students from backend
    function loadStudents() {
        $.ajax({
            url: `${API_BASE_URL}/students`,
            method: 'GET',
            success: function(students) {
                allStudents = students;
                updateDashboard(students);
                updateStudentTables(students);
                renderStudentsPage(1);
            },
            error: function(err) {
                console.error("Error loading students:", err);
                showError("Failed to load students. Check console for details.");
            }
        });
    }

    // 2. Update dashboard with real data
    function updateDashboard(students) {
        $('#totalStudents').text(students.length);
        $('#studentsChange').html(students.length > 0 ? 
            `${students.length} students found` : 'No students in database');
        
        // Real course count (flatten all student courses)
        const allCourses = students.flatMap(s => s.Course);
        const uniqueCourses = [...new Set(allCourses)];
        $('#activeCourses').text(uniqueCourses.length);
    }

    // 3. Update all tables with real student data
    function updateStudentTables(students) {
        // Recent students (last 5 added)
        const recentTable = $('#recentStudentsTable tbody');
        recentTable.empty();
        
        students.slice(0, 5).forEach(student => {
            recentTable.append(`
                <tr>
                    <td>${student.FirstName} ${student.LastName}</td>
                    <td>${student.SID}</td>
                    <td>${student.Email}</td>
                    <td>${student.Course.join(', ')}</td>
                    <td>${new Date().toLocaleDateString()}</td>
                </tr>
            `);
        });

        // Main students table
        const mainTable = $('#studentsTable tbody');
        mainTable.empty();
        
        students.forEach(student => {
            mainTable.append(`
                <tr>
                    <td>${student.FirstName} ${student.LastName}</td>
                    <td>${student.SID}</td>
                    <td>${student.Email}</td>
                    <td>${student.NearCity}</td>
                    <td>${student.Course.map(c => 
                        `<span class="badge bg-primary me-1">${c}</span>`
                    ).join('')}</td>
                    <td>${student.Guardian}</td>
                    <td>
                        <button class="btn btn-sm btn-info view-student" data-sid="${student.SID}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-student" data-sid="${student.SID}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `);
        });
    }

    // 4. Add new student
    $('#addStudentForm').submit(function(e) {
        e.preventDefault();
        
        const newStudent = {
            FirstName: $('#firstName').val(),
            LastName: $('#lastName').val(),
            SID: parseInt($('#sid').val()),
            Email: $('#email').val(),
            NearCity: $('#nearCity').val(),
            Course: getSelectedCourses(),
            Guardian: $('#guardian').val(),
            Subjects: $('#subjects').val() || []
        };

        $.ajax({
            url: `${API_BASE_URL}/students`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(newStudent),
            success: function(response) {
                showSuccess("Student added successfully!");
                loadStudents();
                $('#addStudentForm')[0].reset();
            },
            error: function(xhr) {
                const errorMsg = xhr.responseJSON?.message || "Validation failed";
                showError(errorMsg);
            }
        });
    });

    // Helper: Get selected courses from checkboxes
    function getSelectedCourses() {
        return $('.course-checkbox:checked').map(function() {
            return $(this).val();
        }).get();
    }

    // 5. Delete student
    $(document).on('click', '.delete-student', function() {
        const sid = $(this).data('sid');
        if (confirm(`Delete student #${sid} permanently?`)) {
            $.ajax({
                url: `${API_BASE_URL}/students/sid/${sid}`,
                method: 'DELETE',
                success: function() {
                    showSuccess("Student deleted!");
                    loadStudents();
                },
                error: function(xhr) {
                    showError(xhr.responseJSON?.message || "Deletion failed");
                }
            });
        }
    });

    // 6. View student details
    $(document).on('click', '.view-student', function() {
        const sid = $(this).data('sid');
        $.ajax({
            url: `${API_BASE_URL}/students/sid/${sid}`,
            method: 'GET',
            success: function(student) {
                $('#studentDetailsContent').html(`
                    <h4>${student.FirstName} ${student.LastName}</h4>
                    <p><strong>SID:</strong> ${student.SID}</p>
                    <p><strong>Email:</strong> ${student.Email}</p>
                    <p><strong>City:</strong> ${student.NearCity}</p>
                    <p><strong>Courses:</strong> ${student.Course.join(', ')}</p>
                    <p><strong>Guardian:</strong> ${student.Guardian}</p>
                    <p><strong>Subjects:</strong> ${(student.Subjects || []).join(', ')}</p>
                `);
                $('#studentDetailsModal').modal('show');
                // Store SID for edit
                $('#editStudentBtn').data('sid', student.SID);
            },
            error: function() {
                showError("Failed to load student details");
            }
        });
    });

    // 7. Edit student (open modal with form)
    $(document).on('click', '#editStudentBtn', function() {
        const sid = $(this).data('sid');
        $.ajax({
            url: `${API_BASE_URL}/students/sid/${sid}`,
            method: 'GET',
            success: function(student) {
                // Build edit form
                $('#editStudentContent').html(`
                    <form id="editStudentForm">
                        <div class="row mb-3">
                            <div class="col-md-6 mb-3">
                                <label for="editFirstName" class="form-label">First Name *</label>
                                <input type="text" class="form-control" id="editFirstName" value="${student.FirstName}" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="editLastName" class="form-label">Last Name *</label>
                                <input type="text" class="form-control" id="editLastName" value="${student.LastName}" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="editSID" class="form-label">Student ID*</label>
                                <input type="text" class="form-control" id="editSID" value="${student.SID}" readonly>
                            </div>
                        <div class="mb-3">
                            <label for="editEmail" class="form-label">Email *</label>
                            <input type="email" class="form-control" id="editEmail" value="${student.Email}" required>
                        </div>
                        <div class="mb-3">
                            <label for="editNearCity" class="form-label">Near City *</label>
                            <select class="form-select" id="editNearCity" required>
                                <option value="Kandy" ${student.NearCity === 'Kandy' ? 'selected' : ''}>Kandy</option>
                                <option value="Colombo" ${student.NearCity === 'Colombo' ? 'selected' : ''}>Colombo</option>
                                <option value="Galle" ${student.NearCity === 'Galle' ? 'selected' : ''}>Galle</option>
                                <option value="Jaffna" ${student.NearCity === 'Jaffna' ? 'selected' : ''}>Jaffna</option>
                                <option value="Negombo" ${student.NearCity === 'Negombo' ? 'selected' : ''}>Negombo</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Courses *</label>
                            <div class="form-check">
                                <input class="form-check-input edit-course-checkbox" type="checkbox" value="Foundation" id="editCourseFoundation" ${student.Course.includes('Foundation') ? 'checked' : ''}>
                                <label class="form-check-label" for="editCourseFoundation">Foundation</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input edit-course-checkbox" type="checkbox" value="HND" id="editCourseHND" ${student.Course.includes('HND') ? 'checked' : ''}>
                                <label class="form-check-label" for="editCourseHND">HND</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input edit-course-checkbox" type="checkbox" value="Degree" id="editCourseDegree" ${student.Course.includes('Degree') ? 'checked' : ''}>
                                <label class="form-check-label" for="editCourseDegree">Degree</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input edit-course-checkbox" type="checkbox" value="Diploma" id="editCourseDiploma" ${student.Course.includes('Diploma') ? 'checked' : ''}>
                                <label class="form-check-label" for="editCourseDiploma">Diploma</label>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="editGuardian" class="form-label">Guardian</label>
                            <input type="text" class="form-control" id="editGuardian" value="${student.Guardian || ''}">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Subjects</label>
                            <select class="form-select" id="editSubjects" multiple>
                                <option value="ETF" ${(student.Subjects||[]).includes('ETF') ? 'selected' : ''}>ETF</option>
                                <option value="ORDBMS" ${(student.Subjects||[]).includes('ORDBMS') ? 'selected' : ''}>ORDBMS</option>
                                <option value="OOP" ${(student.Subjects||[]).includes('OOP') ? 'selected' : ''}>OOP</option>
                                <option value="SE" ${(student.Subjects||[]).includes('SE') ? 'selected' : ''}>SE</option>
                                <option value="HCI" ${(student.Subjects||[]).includes('HCI') ? 'selected' : ''}>HCI</option>
                                <option value="IP" ${(student.Subjects||[]).includes('IP') ? 'selected' : ''}>IP</option>
                                <option value="DSA" ${(student.Subjects||[]).includes('DSA') ? 'selected' : ''}>DSA</option>
                                <option value="Web Dev" ${(student.Subjects||[]).includes('Web Dev') ? 'selected' : ''}>Web Dev</option>
                            </select>
                        </div>
                    </form>
                `);
                $('#editStudentModal').modal('show');
                // Store SID for save
                $('#saveStudentChanges').data('sid', student.SID);
            },
            error: function() {
                showError("Failed to load student for editing");
            }
        });
    });

    // 8. Save student changes (edit)
    $(document).on('click', '#saveStudentChanges', function() {
        const sid = $(this).data('sid');
        const updatedStudent = {
            FirstName: $('#editFirstName').val(),
            LastName: $('#editLastName').val(),
            Email: $('#editEmail').val(),
            NearCity: $('#editNearCity').val(),
            Course: $('.edit-course-checkbox:checked').map(function() { return $(this).val(); }).get(),
            Guardian: $('#editGuardian').val(),
            Subjects: $('#editSubjects').val() || []
        };
        $.ajax({
            url: `${API_BASE_URL}/students/sid/${sid}`,
            method: 'PATCH',
            contentType: 'application/json',
            data: JSON.stringify(updatedStudent),
            success: function(response) {
                showSuccess("Student updated successfully!");
                $('#editStudentModal').modal('hide');
                $('#studentDetailsModal').modal('hide');
                loadStudents();
            },
            error: function(xhr) {
                showError(xhr.responseJSON?.message || "Update failed");
            }
        });
    });

    // Calendar button (dashboard)
    $(document).on('click', '#dashboardCalendarBtn', function() {
        $('#calendarModal').modal('show');
    });
    // Share button (dashboard)
    $(document).on('click', '#dashboardShareBtn', function() {
        $('#shareModal').modal('show');
    });
    // Profile button (navbar dropdown)
    $(document).on('click', '#profileDropdownBtn', function() {
        $('#profileModal').modal('show');
    });

    // SETTINGS TAB LOGIC
    // Load settings from localStorage
    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('systemSettings')) || {};
        if (settings.systemName) $('#systemName').val(settings.systemName);
        if (settings.recordsPerPage) $('#recordsPerPage').val(settings.recordsPerPage);
        $('#emailNotifications').prop('checked', settings.emailNotifications !== false);
        $('#backupEnabled').prop('checked', settings.backupEnabled !== false);
    }
    // Save settings to localStorage
    $('#generalSettingsForm').submit(function(e) {
        e.preventDefault();
        const settings = {
            systemName: $('#systemName').val(),
            recordsPerPage: $('#recordsPerPage').val(),
            emailNotifications: $('#emailNotifications').is(':checked'),
            backupEnabled: $('#backupEnabled').is(':checked')
        };
        localStorage.setItem('systemSettings', JSON.stringify(settings));
        showSuccess('Settings saved!');
    });
    // User account form (simulate password change)
    $('#userAccountForm').submit(function(e) {
        e.preventDefault();
        const newPass = $('#newPassword').val();
        const confirmPass = $('#confirmPassword').val();
        if (!newPass || !confirmPass) {
            showError('Please enter and confirm your new password.');
            return;
        }
        if (newPass !== confirmPass) {
            showError('Passwords do not match!');
            return;
        }
        // Simulate password change
        showSuccess('Password changed successfully!');
        $('#newPassword').val('');
        $('#confirmPassword').val('');
    });
    // Danger zone: Clear cache
    $('#clearCacheBtn').click(function() {
        localStorage.clear();
        showSuccess('System cache cleared!');
        loadSettings();
    });
    // Danger zone: Reset to default settings
    $('#resetSettingsBtn').click(function() {
        localStorage.removeItem('systemSettings');
        showSuccess('Settings reset to default!');
        loadSettings();
    });
    // Danger zone: Delete all student data (requires backend endpoint)
    $('#deleteAllDataBtn').click(function() {
        if (confirm('Are you sure you want to delete ALL student data? This cannot be undone!')) {
            $.ajax({
                url: `${API_BASE_URL}/students`,
                method: 'DELETE',
                success: function() {
                    showSuccess('All student data deleted!');
                    loadStudents();
                },
                error: function() {
                    showError('Failed to delete all student data.');
                }
            });
        }
    });
    // Load settings on page load
    loadSettings();

    // 1. Fix tab navigation (Bootstrap tabs)
    $(document).on('click', '.nav-link[data-bs-toggle="tab"]', function(e) {
        e.preventDefault();
        $('.nav-link').removeClass('active text-white').addClass('text-white-50');
        $(this).addClass('active text-white').removeClass('text-white-50');
        $('.tab-pane').removeClass('show active');
        var target = $(this).attr('href');
        $(target).addClass('show active');
    });

    // 2. Reports tab: show all students in reportTable
    function updateReportTable(students) {
        const reportTable = $('#reportTable tbody');
        reportTable.empty();
        if (!students.length) {
            reportTable.append('<tr><td colspan="7" class="text-center">No data</td></tr>');
            return;
        }
        students.forEach(student => {
            reportTable.append(`
                <tr>
                    <td>${student.FirstName} ${student.LastName}</td>
                    <td>${student.SID}</td>
                    <td>${student.Email}</td>
                    <td>${student.NearCity}</td>
                    <td>${student.Course.join(', ')}</td>
                    <td>${(student.Subjects||[]).join(', ')}</td>
                    <td>${student.Guardian}</td>
                </tr>
            `);
        });
    }

    // 4. Search students
    $('#searchForm').submit(function(e) {
        e.preventDefault();
        const firstName = $('#searchFirstName').val().toLowerCase();
        const lastName = $('#searchLastName').val().toLowerCase();
        const sid = $('#searchSID').val();
        const email = $('#searchEmail').val().toLowerCase();
        const city = $('#searchCity').val();
        const course = $('#searchCourse').val();
        const guardian = $('#searchGuardian').val().toLowerCase();
        $.ajax({
            url: `${API_BASE_URL}/students`,
            method: 'GET',
            success: function(students) {
                const filtered = students.filter(s =>
                    (!firstName || s.FirstName.toLowerCase().includes(firstName)) &&
                    (!lastName || s.LastName.toLowerCase().includes(lastName)) &&
                    (!sid || String(s.SID) === sid) &&
                    (!email || s.Email.toLowerCase().includes(email)) &&
                    (!city || s.NearCity === city) &&
                    (!course || s.Course.includes(course)) &&
                    (!guardian || (s.Guardian||'').toLowerCase().includes(guardian))
                );
                const table = $('#searchResultsTable tbody');
                table.empty();
                if (!filtered.length) {
                    table.append('<tr><td colspan="6" class="text-center">No students found.</td></tr>');
                } else {
                    filtered.forEach(student => {
                        table.append(`
                            <tr>
                                <td>${student.FirstName} ${student.LastName}</td>
                                <td>${student.SID}</td>
                                <td>${student.Email}</td>
                                <td>${student.NearCity}</td>
                                <td>${student.Course.join(', ')}</td>
                                <td>
                                    <button class="btn btn-sm btn-info view-student" data-sid="${student.SID}"><i class="fas fa-eye"></i></button>
                                    <button class="btn btn-sm btn-danger delete-student" data-sid="${student.SID}"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        `);
                    });
                }
            },
            error: function() {
                showError('Search failed.');
            }
        });
    });

    // 5. Dummy data for pending requests/events
    function updateDashboardExtras() {
        $('#pendingRequests').text('0');
        $('#requestsChange').text('No pending requests');
        $('#upcomingEvents').text('2');
        $('#eventsChange').text('2 events this week');
    }

    // 7. Export students as CSV
    $('#exportStudents, #exportReport').click(function() {
        $.ajax({
            url: `${API_BASE_URL}/students`,
            method: 'GET',
            success: function(students) {
                let csv = 'Name,SID,Email,Near City,Courses,Guardian,Subjects\n';
                students.forEach(s => {
                    csv += `"${s.FirstName} ${s.LastName}",${s.SID},${s.Email},${s.NearCity},"${s.Course.join('; ')}",${s.Guardian},"${(s.Subjects||[]).join('; ')}"\n`;
                });
                const blob = new Blob([csv], {type: 'text/csv'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'students.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                showSuccess('Exported as students.csv!');
            },
            error: function() { showError('Export failed.'); }
        });
    });

    // Update dashboard extras on load
    updateDashboardExtras();

    // Update report table on load
    function loadAndUpdateReportTable() {
        $.ajax({
            url: `${API_BASE_URL}/students`,
            method: 'GET',
            success: function(students) {
                updateReportTable(students);
            }
        });
    }
    // When Reports tab is shown, update table
    $(document).on('click', 'a[href="#reports"]', function() {
        loadAndUpdateReportTable();
    });

    // Initial data load
    loadStudents();

    // PROFILE MODAL LOGIC
    function loadProfile() {
        const profile = JSON.parse(localStorage.getItem('userProfile')) || { name: 'Admin', email: 'admin@email.com' };
        $('#profileName').val(profile.name);
        $('#profileEmail').val(profile.email);
    }
    $('#profileModal').on('show.bs.modal', function() {
        loadProfile();
    });
    $('#profileForm').submit(function(e) {
        e.preventDefault();
        const profile = {
            name: $('#profileName').val(),
            email: $('#profileEmail').val()
        };
        localStorage.setItem('userProfile', JSON.stringify(profile));
        showSuccess('Profile updated!');
        $('#profileModal').modal('hide');
    });

    // REAL CALENDAR LOGIC
    let calendarInstance = null;
    $('#calendarModal').on('shown.bs.modal', function() {
        if (calendarInstance) {
            calendarInstance.destroy();
        }
        calendarInstance = flatpickr('#calendarContainer', {
            inline: true,
            enableTime: false,
            dateFormat: 'Y-m-d',
        });
    });
    $('#calendarModal').on('hidden.bs.modal', function() {
        if (calendarInstance) {
            calendarInstance.destroy();
            calendarInstance = null;
        }
    });

    // REAL SHARE LOGIC
    $(document).on('click', '#copyShareLinkBtn', function() {
        const link = $('#shareLink').val();
        navigator.clipboard.writeText(link).then(function() {
            $('#shareCopyMsg').show();
            setTimeout(() => $('#shareCopyMsg').hide(), 2000);
        });
    });

    // Top-right dropdown Settings: open Settings tab
    $(document).on('click', '#settingsDropdownBtn', function(e) {
        e.preventDefault();
        // Activate sidebar Settings tab
        $('.nav-link[href="#settings"]').trigger('click');
    });

    // Dashboard Export button: download students as CSV
    $(document).on('click', '#exportDashboard', function() {
        $.ajax({
            url: `${API_BASE_URL}/students`,
            method: 'GET',
            success: function(students) {
                let csv = 'Name,SID,Email,Near City,Courses,Guardian,Subjects\n';
                students.forEach(s => {
                    csv += `"${s.FirstName} ${s.LastName}",${s.SID},${s.Email},${s.NearCity},"${s.Course.join('; ')}",${s.Guardian},"${(s.Subjects||[]).join('; ')}"\n`;
                });
                const blob = new Blob([csv], {type: 'text/csv'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'students.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                showSuccess('Exported as students.csv!');
            },
            error: function() { showError('Export failed.'); }
        });
    });

    // Example notifications array (replace with real data or fetch from backend)
    const notifications = [
        { message: 'New student added: Harry Potter', time: 'Just now' },
        { message: 'Backup completed successfully', time: '5 min ago' }
    ];

    $(document).on('click', '#notificationBell', function(e) {
        e.preventDefault();
        let html = '';
        if (notifications.length === 0) {
            html = '<p>No new notifications.</p>';
        } else {
            html = '<ul class="list-group">';
            notifications.forEach(n => {
                html += `<li class="list-group-item d-flex justify-content-between align-items-center">
                            ${n.message}
                            <span class="badge bg-secondary rounded-pill">${n.time}</span>
                        </li>`;
            });
            html += '</ul>';
        }
        $('#notificationContent').html(html);
        $('#notificationModal').modal('show');
    });

    // Pagination click handlers:
    $(document).on('click', '#studentPagination .page-link', function(e) {
        e.preventDefault();
        const page = parseInt($(this).data('page'));
        const totalPages = Math.ceil(allStudents.length / studentsPerPage);
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            renderStudentsPage(page);
        }
    });

    // Show/hide dropdown items based on login state
    function updateUserDropdown(loggedIn) {
        // Profile is always shown
        $('#profileDropdownBtn').show();
        if (loggedIn) {
            $('#settingsDropdownBtn, #logoutBtn').show();
            $('#loginBtn, #registerBtn').hide();
        } else {
            $('#settingsDropdownBtn, #logoutBtn').hide();
            $('#loginBtn, #registerBtn').show();
        }
    }
    // On page load, check login state
    $(function() {
        const token = localStorage.getItem('token');
        updateUserDropdown(!!token);
    });

    // Logout button: clear token and redirect to login
    $(document).on('click', '#logoutBtn', function(e) {
        e.preventDefault();
        localStorage.removeItem('token');
        updateUserDropdown(false);
        window.location.href = 'login.html';
    });
});